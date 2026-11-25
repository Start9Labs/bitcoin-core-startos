import { setupOnionTarget } from 'tor-startos/startos/utils/target'
import { manifest } from '../manifest'
import { sdk } from '../sdk'
import { peerHostId, peerPortInternal, peerPortOnion } from '../utils'

export const onionBinding = {
  packageId: manifest.id,
  hostId: peerHostId,
  internalPort: peerPortInternal,
}

export const onionTarget = setupOnionTarget(sdk, {
  ...onionBinding,
  target: peerPortOnion,
})
