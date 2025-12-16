import { peerConfig } from '../actions/config/peers'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import { peerInterfaceId } from '../utils'

export const taskSetExternal = sdk.setupOnInit(async (effects, kind) => {
  const publicPeerUrls =
    (await sdk.serviceInterface.getOwn(effects, peerInterfaceId).const())
      ?.addressInfo?.public.format() || []

  const externalIp = await bitcoinConfFile.read((b) => b.externalip).once()

  if (externalIp && !publicPeerUrls.includes(externalIp)) {
    await bitcoinConfFile.merge(effects, { externalip: undefined })

    await sdk.action.createOwnTask(effects, peerConfig, 'important', {
      reason:
        'External address removed. Your node can only make outbound connections. Select a new external address to re-enable inbound connections.',
    })
  }
})
