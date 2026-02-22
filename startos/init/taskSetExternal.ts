import { inboundConnections } from '../actions/config/inboundConnections'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { peerInterfaceId } from '../utils'

export const taskSetExternal = sdk.setupOnInit(async (effects, kind) => {
  const publicPeerUrls = await sdk.serviceInterface
    .getOwn(
      effects,
      peerInterfaceId,
      (iface) => iface?.addressInfo?.public.format() || [],
    )
    .const()

  const externalIp = await bitcoinConfFile
    .read((b) => b.externalip)
    .const(effects)

  // If wantsOnion is true, dependencies.ts handles the externalip lifecycle
  const wantsOnion = await storeJson.read((s) => s.wantsOnion).const(effects)

  if (!wantsOnion && externalIp && !publicPeerUrls.includes(externalIp)) {
    await bitcoinConfFile.merge(
      effects,
      { externalip: undefined },
      { allowWriteAfterConst: true },
    )

    await sdk.action.createOwnTask(effects, inboundConnections, 'important', {
      reason: i18n(
        'External address removed. Your node can only make outbound connections. Select a new external address to re-enable inbound connections.',
      ),
    })
  }
})
