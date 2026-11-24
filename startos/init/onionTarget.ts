import { setupOnionTarget } from 'tor-startos/startos/utils/target'
import { manifest } from '../manifest'
import { sdk } from '../sdk'
import { peerHostId, peerPortInternal, peerPortOnion } from '../utils'

export const onionTarget = setupOnionTarget(sdk, {
  packageId: manifest.id,
  hostId: peerHostId,
  internalPort: peerPortInternal,
  target: peerPortOnion,
})
