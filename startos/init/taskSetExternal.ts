import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { storeJson } from '../fileModels/store.json'
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

  // If wantsOnion is true, dependencies.ts handles the externalip lifecycle
  const wantsOnion = await storeJson.read((s) => s.wantsOnion).const(effects)

  const externalIp = await bitcoinConfFile
    .read((b) => b.raw?.externalip)
    .const(effects)

  if (!wantsOnion && externalIp && !publicPeerUrls.includes(externalIp)) {
    await bitcoinConfFile.merge(
      effects,
      { raw: { externalip: undefined } },
      { allowWriteAfterConst: true },
    )
  }
})
