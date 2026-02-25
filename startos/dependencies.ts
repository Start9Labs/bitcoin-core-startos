import { addOnionService } from 'tor-startos/startos/actions/addOnionService'
import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { peerInterfaceId, peerPortInternal } from './utils'

const torTaskReplayId = 'tor:add-onion-service'

const torDep = {
  tor: {
    kind: 'running',
    versionRange: '>=0.4.8:0-beta.0',
    healthChecks: [],
  },
}

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const { externalip, onlynet } =
    (await bitcoinConfFile
      .read((b) => ({ externalip: b.raw?.externalip, onlynet: b.onlynet }))
      .const(effects)) ?? {}

  const wantsOnion = await storeJson.read((s) => s.wantsOnion).const(effects)

  const onlynetList = [onlynet ?? []].flat()
  const needsTor =
    wantsOnion ||
    (externalip && externalip.includes('.onion')) ||
    onlynetList.includes('onion')

  let shouldCreateTask = false

  if (wantsOnion) {
    const onionUrl = await sdk.serviceInterface
      .getOwn(effects, peerInterfaceId, (iface) =>
        (iface?.addressInfo?.public.format() || []).find((url) =>
          url.includes('.onion'),
        ),
      )
      .const()

    if (onionUrl) {
      // Tor fulfilled the request — set externalip to the onion and clear wantsOnion
      await bitcoinConfFile.merge(
        effects,
        { raw: { externalip: onionUrl } },
        { allowWriteAfterConst: true },
      )
      await storeJson.merge(
        effects,
        { wantsOnion: false },
        { allowWriteAfterConst: true },
      )
    } else {
      // Clear non-onion externalip while waiting for onion
      if (externalip && !externalip.includes('.onion')) {
        await bitcoinConfFile.merge(
          effects,
          { raw: { externalip: undefined } },
          { allowWriteAfterConst: true },
        )
      }
      shouldCreateTask = true
    }
  }

  if (shouldCreateTask) {
    await sdk.action.createTask(effects, 'tor', addOnionService, 'important', {
      input: {
        kind: 'partial',
        value: {
          urlPluginMetadata: {
            packageId: 'bitcoind',
            interfaceId: peerInterfaceId,
            hostId: 'peer',
            internalPort: peerPortInternal,
          },
          address: { selection: 'new', value: {} },
        },
      },
      reason: i18n(
        'Bitcoin Core needs a Tor onion address for inbound peer connections.',
      ),
    })
  } else {
    await sdk.action.clearTask(effects, torTaskReplayId)
  }

  return needsTor ? torDep : {}
})
