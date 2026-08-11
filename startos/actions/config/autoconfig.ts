import { bitcoinConfFile, fullConfigSpec } from '../../fileModels/bitcoin.conf'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

// The surface a dependency may drive. Everything outside it — `raw` above all,
// which carries rpcauth, whitelist, externalip, connect and addnode and renders
// as nothing at all in the form — is unreachable from a dependent's task.
const dependentConfigSpec = fullConfigSpec.filter({
  blockfilters: true,
  blocknotify: true,
  coinstatsindex: true,
  peerbloomfilters: true,
  prune: true,
  txindex: true,
  zmqEnabled: true,
})

export const autoconfig = sdk.Action.withInput(
  // id
  'autoconfig',

  // metadata
  async ({ effects }) => ({
    name: i18n('Auto-Configure'),
    description: i18n(
      'Automatically configure bitcoin.conf for the needs of a another service',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  // input spec
  async ({ effects, prefill }) => {
    if (!prefill) return dependentConfigSpec

    return dependentConfigSpec
      .filterFromPartial(prefill as typeof dependentConfigSpec._PARTIAL)
      .disableFromPartial(
        prefill as typeof dependentConfigSpec._PARTIAL,
        i18n('These fields were provided by a task and cannot be edited'),
      )
  },

  // optionally pre-fill form
  async ({ effects }) => bitcoinConfFile.read().once(),

  // execution function
  ({ effects, input }) => bitcoinConfFile.merge(effects, input),
)
