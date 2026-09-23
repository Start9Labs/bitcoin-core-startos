import { ExtendedVersion, IST, T, VersionRange } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { manifest } from '../manifest'
import { sdk } from '../sdk'
import { peerHostId, peerInterfaceId, peerPortInternal } from '../utils'

/** Tor releases whose Add Onion Service a service may run for its own hosts. */
const torAttachesForServices = VersionRange.parse('>=0.4.9.12:7')

const urlPluginMetadata = {
  packageId: manifest.id,
  hostId: peerHostId,
  interfaceId: peerInterfaceId,
  internalPort: peerPortInternal,
}

/** Ids of the peer host's unused .onion addresses, as Tor's form offers them. */
async function unusedPeerOnions(effects: T.Effects): Promise<string[]> {
  const form = await effects.action.getInput({
    packageId: 'tor',
    actionId: 'add-onion-service',
    prefill: { urlPluginMetadata },
  })
  const address = (form?.spec as IST.InputSpec | undefined)?.address
  if (address?.type !== 'union') return []
  return Object.keys(address.variants).filter((id) => id !== 'new')
}

/**
 * Attaches the peer host's unused .onion addresses to the peer binding after
 * the retirement of 8333 left them unused, once Tor lets this service do it.
 */
export const reattachPeerOnions = sdk.setupOnInit(async (effects) => {
  const pending = await storeJson
    .read((s) => s.reattachPeerOnions)
    .const(effects)
  if (!pending) return

  const torVersion = await sdk
    .getServiceManifest(effects, 'tor', (m) => m?.version ?? null)
    .const()
  if (
    !torVersion ||
    !ExtendedVersion.parse(torVersion).satisfies(torAttachesForServices)
  )
    return

  try {
    for (const selection of await unusedPeerOnions(effects)) {
      await sdk.action.run({
        effects,
        packageId: 'tor',
        actionId: 'add-onion-service',
        prefill: { urlPluginMetadata },
        input: () => ({
          urlPluginMetadata,
          address: { selection, value: {} },
        }),
      })
    }
    await storeJson.merge(
      effects,
      { reattachPeerOnions: false },
      { allowWriteAfterConst: true },
    )
  } catch (e) {
    console.warn(`Peer .onion addresses not reattached yet: ${String(e)}`)
  }
})
