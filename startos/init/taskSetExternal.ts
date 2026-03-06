import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
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
    .read((b) => b.raw?.externalip)
    .const(effects)

  if (externalIp && !publicPeerUrls.includes(externalIp)) {
    await bitcoinConfFile.merge(
      effects,
      { raw: { externalip: undefined } },
      { allowWriteAfterConst: true },
    )
  }
})
