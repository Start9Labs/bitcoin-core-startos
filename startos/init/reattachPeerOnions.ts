import { setupOnionReattachment } from 'tor-startos/startos/utils/reattach'
import { storeJson } from '../fileModels/store.json'
import { manifest } from '../manifest'
import { sdk } from '../sdk'
import { peerHostId, peerInterfaceId, peerPortInternal } from '../utils'

// The StartOS 0.3.5 package bound container port 8333 on the peer host. This
// runs on every init rather than in a migration: a Core install whose data
// version is a range (left by a Knots switch) never runs an up().
export const retireLegacyPeerPort = sdk.setupOnInit(async (effects) => {
  if (await sdk.MultiHost.of(effects, peerHostId).retirePort(8333)) {
    await storeJson.merge(effects, { reattachPeerOnions: true })
  }
})

export const reattachPeerOnions = setupOnionReattachment(sdk, {
  packageId: manifest.id,
  hostId: peerHostId,
  to: {
    interfaceId: peerInterfaceId,
    internalPort: peerPortInternal,
    ssl: false,
  },
  pending: storeJson.read((s) => s.reattachPeerOnions),
  clear: (effects) =>
    storeJson.merge(
      effects,
      { reattachPeerOnions: false },
      { allowWriteAfterConst: true },
    ),
})
