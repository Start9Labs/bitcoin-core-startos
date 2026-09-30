const assert = require('node:assert/strict')
const { test, beforeEach } = require('node:test')
const ts = require('typescript')

require.extensions['.ts'] = (module, filename) => {
  const source = require('node:fs').readFileSync(filename, 'utf8')
  module._compile(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: filename,
    }).outputText,
    filename,
  )
}

const { sdk } = require('../startos/sdk.ts')
const { storeJson } = require('../startos/fileModels/store.json.ts')
const watch = (read) => ({
  once: async () => read(),
  const: async () => read(),
})
let pending, enabled, version, variants, calls, fail
sdk.setupOnInit = (fn) => fn
storeJson.read = (project) =>
  watch(() => project({ reattachPeerOnions: pending }))
storeJson.merge = async (_effects, patch) => {
  pending = patch.reattachPeerOnions
}
sdk.host.get = (_effects, opts, project) => {
  assert.equal(opts.hostId, 'peer')
  return watch(() => project({ bindings: { 58333: { enabled } } }))
}
sdk.getServiceManifest = (_effects, packageId, project) => {
  assert.equal(packageId, 'tor')
  return watch(() => project(version ? { version } : null))
}
sdk.action.run = async (opts) => {
  assert.equal(opts.packageId, 'tor')
  assert.equal(opts.actionId, 'add-onion-service')
  const input = opts.input()
  assert.deepEqual(input.urlPluginMetadata, {
    packageId: 'bitcoind',
    hostId: 'peer',
    interfaceId: 'peer',
    internalPort: 58333,
  })
  if (fail) throw new Error('Tor action unavailable')
  calls.push(input.address.selection)
}
const effects = {
  action: {
    getInput: async (opts) => {
      assert.equal(opts.packageId, 'tor')
      return { spec: { address: { type: 'union', variants } } }
    },
  },
}
const { reattachPeerOnions } = require('../startos/init/reattachPeerOnions.ts')

beforeEach(() => {
  pending = true
  enabled = true
  version = '0.4.9.13:1'
  variants = { 'bitcoind/peer/0': {}, new: {} }
  calls = []
  fail = false
})

test('released Tor without public actions leaves migration pending', async () => {
  for (version of [null, '0.4.9.12:7', '0.4.9.13:0']) {
    await reattachPeerOnions(effects)
    assert.equal(pending, true)
    assert.deepEqual(calls, [])
  }
})

test('only the peer host’s addresses are automatically reattached', async () => {
  variants['bitcoind/rpc/0'] = {}
  variants['bitcoind/old-peer/0'] = {}
  variants['another/peer/0'] = {}
  await reattachPeerOnions(effects)
  assert.deepEqual(calls, ['bitcoind/peer/0'])
  assert.equal(pending, false)
  await reattachPeerOnions(effects)
  assert.equal(calls.length, 1)
})

test('binding creation and a newer Tor version can unblock a pending migration', async () => {
  enabled = false
  await reattachPeerOnions(effects)
  assert.equal(pending, true)
  enabled = true
  await reattachPeerOnions(effects)
  assert.equal(pending, false)
})

test('a failed attachment stays pending for a retry', async () => {
  fail = true
  await reattachPeerOnions(effects)
  assert.equal(pending, true)
  fail = false
  await reattachPeerOnions(effects)
  assert.equal(pending, false)
  assert.deepEqual(calls, ['bitcoind/peer/0'])
})
