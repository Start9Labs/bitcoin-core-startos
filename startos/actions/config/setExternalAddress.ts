import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { peerInterfaceId } from '../../utils'

const { Value } = sdk

export const setExternalAddress = sdk.Action.withInput(
  // id
  'set-external-address',

  // metadata
  async () => ({
    name: i18n('Set External Address'),
    description: i18n(
      'Set the address at which your node can be reached by peers',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // form input specification
  sdk.InputSpec.of({
    externalip: Value.dynamicSelect(async ({ effects }) => {
      const urls = await sdk.serviceInterface
        .getOwn(
          effects,
          peerInterfaceId,
          (iface) => iface?.addressInfo?.public.format() || [],
        )
        .const()

      const values: Record<string, string> = { none: 'None' }
      for (const url of urls) {
        // Only include IPv4, IPv6, and .onion addresses — exclude domains
        const host = url.split(':')[0]
        const isIp = /^[\d.]+$/.test(host) || host.includes(':')
        const isOnion = host.endsWith('.onion')
        if (isIp || isOnion) values[url] = url
      }

      return {
        name: i18n('External Address'),
        description: i18n(
          'Select the address at which your node can be reached by peers.',
        ),
        values,
        default: 'none',
      }
    }),
  }),

  // prefill
  async () => {
    const externalip = await bitcoinConfFile
      .read((b) => b.raw?.externalip)
      .once()

    return { externalip: externalip || 'none' }
  },

  // execution
  async ({ effects, input }) => {
    await bitcoinConfFile.merge(effects, {
      raw: {
        externalip: input.externalip === 'none' ? undefined : input.externalip,
      },
    })

    return null
  },
)
