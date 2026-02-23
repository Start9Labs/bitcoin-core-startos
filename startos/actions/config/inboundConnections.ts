import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { storeJson } from '../../fileModels/store.json'
import { sdk } from '../../sdk'
import { peerInterfaceId } from '../../utils'
import { i18n } from '../../i18n'

const { Value, Variants, InputSpec } = sdk

const inboundConnectionsSpec = InputSpec.of({
  inbound: Value.dynamicUnion(async ({ effects }) => {
    const urls = await sdk.serviceInterface
      .getOwn(
        effects,
        peerInterfaceId,
        (iface) => iface?.addressInfo?.public.format() || [],
      )
      .const()
    const hasOnion = urls.some((url) => url.includes('.onion'))

    const addressValues: Record<string, string> = {}
    for (const url of urls) {
      addressValues[url] = url
    }
    if (!hasOnion) {
      addressValues['create-tor'] = i18n('Create Tor Address')
    }

    return {
      name: i18n('Inbound Connections'),
      description: i18n(
        'Choose whether to allow other nodes to connect to yours.',
      ),
      default: 'allow',
      disabled: false,
      variants: Variants.of({
        allow: {
          name: i18n('Enabled (Recommended)'),
          spec: InputSpec.of({
            externalip: Value.select({
              name: i18n('Public Address'),
              description: i18n(
                'Select the address at which your node can be reached by peers.',
              ),
              values: addressValues,
              default: urls[0] || 'create-tor',
            }),
          }),
        },
        disable: {
          name: i18n('Disabled'),
          spec: InputSpec.of({}),
        },
      }),
    }
  }),
})

export const inboundConnections = sdk.Action.withInput(
  // id
  'inbound-connections',

  // metadata
  async ({ effects }) => ({
    name: i18n('Inbound Connections'),
    description: i18n(
      'Configure whether and how your node is reachable by peers on the Bitcoin network.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // form input specification
  inboundConnectionsSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const externalip = await bitcoinConfFile.read((b) => b.externalip).once()

    if (!externalip) {
      const wantsOnion = await storeJson.read((s) => s.wantsOnion).once()

      if (wantsOnion === false) {
        return {
          inbound: { selection: 'disable' as const, value: {} },
        }
      }

      return {
        inbound: {
          selection: 'allow' as const,
          value: { externalip: 'create-tor' },
        },
      }
    }

    return {
      inbound: {
        selection: 'allow' as const,
        value: { externalip },
      },
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const inbound = input.inbound as {
      selection: 'allow' | 'disable'
      value: { externalip?: string }
    }

    if (inbound.selection === 'disable') {
      await bitcoinConfFile.merge(effects, { externalip: undefined })
      await storeJson.merge(effects, { wantsOnion: false })
      return
    }

    const { externalip } = inbound.value

    if (externalip === 'create-tor') {
      await storeJson.merge(effects, { wantsOnion: true })
    } else {
      await bitcoinConfFile.merge(effects, { externalip })
      await storeJson.merge(effects, { wantsOnion: false })
    }
  },
)
