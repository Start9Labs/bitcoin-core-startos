import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import { peerInterfaceId } from '../utils'

export const watchHosts = sdk.setupOnInit(async (effects, kind) => {
  const publicInfo = await sdk.serviceInterface
    .getOwn(effects, peerInterfaceId, (i) =>
      i?.addressInfo?.public.filter({
        exclude: { kind: 'domain' },
      }),
    )
    .const()

  if (!publicInfo) return

  const externalip: string[] = []

  const onions = publicInfo
    .filter({
      predicate: ({ metadata }) =>
        metadata.kind === 'plugin' && metadata.packageId === 'tor',
    })
    .format()

  externalip.push(...onions)

  const ipv4s = publicInfo.filter({ kind: 'ipv4' }).format()

  externalip.push(...ipv4s)

  await bitcoinConfFile.merge(
    effects,
    {
      raw: {
        externalip: externalip.length > 0 ? externalip : undefined,
      },
    },
    { allowWriteAfterConst: true },
  )
})
