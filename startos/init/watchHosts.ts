import { utils } from '@start9labs/start-sdk'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import { peerInterfaceId } from '../utils'

export const watchHosts = sdk.setupOnInit(async (effects, kind) => {
  const host = await sdk.host.getOwn(effects, peerInterfaceId).const()
  const peerIface = host
    ? Object.values(host.bindings)
        .flatMap((b) => Object.values(b.interfaces))
        .find((i) => i.id === peerInterfaceId)
    : undefined
  const publicInfo =
    host && peerIface
      ? utils
          .filledAddress(host, peerIface.addressInfo)
          .public.filter({ exclude: { kind: 'domain' } })
      : undefined

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
