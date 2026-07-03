import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import { peerHostId, peerInterfaceId } from '../utils'

export const watchHosts = sdk.setupOnInit(async (effects, kind) => {
  // One subscription on the peer host; the map fn returns just the advertised
  // externalip list (onions + public IPv4), so this re-runs only when that
  // list changes rather than on unrelated host churn.
  const externalip = await sdk.host
    .getOwn(effects, peerHostId, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === peerInterfaceId)
      if (!host || !iface) return undefined
      const publicInfo = iface.addressInfo.public.filter({
        exclude: { kind: 'domain' },
      })
      return [
        ...publicInfo
          .filter({
            predicate: ({ metadata }) =>
              metadata.kind === 'plugin' && metadata.packageId === 'tor',
          })
          .format(),
        ...publicInfo.filter({ kind: 'ipv4' }).format(),
      ]
    })
    .const()

  if (!externalip) return

  await bitcoinConfFile.merge(
    effects,
    { raw: { externalip: externalip.length > 0 ? externalip : undefined } },
    { allowWriteAfterConst: true },
  )
})
