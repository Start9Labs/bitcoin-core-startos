import { bitcoinConfFile, fullConfigSpec } from '../../fileModels/bitcoin.conf'
import { storeJson } from '../../fileModels/store.json'
import { sdk } from '../../sdk'
import { i2PSamAddress, peerInterfaceId } from '../../utils'

import { i18n } from '../../i18n'

const { Value, Variants, InputSpec } = sdk

export const peerConfig = sdk.Action.withInput(
  // id
  'peers-config',

  // metadata
  async ({ effects }) => ({
    name: i18n('Peer Settings'),
    description: i18n('Edit the Peer settings in bitcoin.conf'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // form input specification
  fullConfigSpec
    .filter({
      onlynet: true,
      v2transport: true,
      i2psam: true,
      connectpeer: true,
      maxconnections: true,
    })
    .add({
      i2psam: Value.union({
        name: i18n('I2P SAM Proxy'),
        description: i18n('Select how to connect to the I2P network.'),
        default: 'enabled',
        variants: Variants.of({
          disabled: {
            name: i18n('Disabled'),
            spec: InputSpec.of({}),
          },
          enabled: {
            name: i18n('Enabled'),
            spec: sdk.InputSpec.of({
              i2pacceptincoming: Value.toggle({
                name: i18n('Accept Incoming I2P Connections'),
                description: i18n(
                  'Accept inbound I2P connections (effective only when I2P is enabled).',
                ),
                default: true,
              }),
            }),
          },
        }),
      }),
      externalip: Value.dynamicSelect(async ({ effects }) => {
        const urls = await sdk.serviceInterface
          .getOwn(
            effects,
            peerInterfaceId,
            (iface) => iface?.addressInfo?.public.format() || [],
          )
          .const()
        const hasOnion = urls.some((url) => url.includes('.onion'))

        const values: Record<string, string> = { none: 'None' }
        for (const url of urls) values[url] = url
        if (!hasOnion) values['create-tor'] = i18n('Create Tor Address')

        return {
          name: i18n('Public Address'),
          description: i18n(
            'Select the address at which your node can be reached by peers.',
          ),
          values,
          default: 'none',
        }
      }),
    }),
  // optionally pre-fill the input form
  async ({ effects }) => {
    const bitcoinConf = await bitcoinConfFile.read().once()

    if (!bitcoinConf?.raw) return {}

    const { i2psam, i2pacceptincoming } = bitcoinConf.raw
    const wantsOnion = await storeJson.read((s) => s.wantsOnion).once()

    return {
      ...bitcoinConf,
      i2psam:
        i2psam === undefined
          ? { selection: 'disabled' as const, value: {} }
          : {
              selection: 'enabled' as const,
              value: {
                i2pacceptincoming: i2pacceptincoming ?? true,
              },
            },
      externalip: wantsOnion ? 'create-tor' : (bitcoinConf.raw.externalip || 'none'),
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const { i2psam, externalip } = input

    if (externalip === 'create-tor') {
      await storeJson.merge(effects, { wantsOnion: true })
    } else {
      await storeJson.merge(effects, { wantsOnion: false })
    }

    await bitcoinConfFile.merge(effects, {
      raw: {
        i2psam: i2psam.selection === 'enabled' ? i2PSamAddress : undefined,
        i2pacceptincoming:
          i2psam.selection === 'enabled' && i2psam.value.i2pacceptincoming,
        externalip:
          externalip === 'create-tor' || externalip === 'none'
            ? undefined
            : externalip,
      },
      ...input,
    })
  },
)
