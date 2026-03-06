import { bitcoinConfFile, fullConfigSpec } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import { i2PSamAddress } from '../../utils'

import { i18n } from '../../i18n'

const { Value, Variants, InputSpec } = sdk

export const peerConfig = sdk.Action.withInput(
  // id
  'peers-config',

  // metadata
  async () => ({
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
    }),

  // optionally pre-fill the input form
  async () => {
    const bitcoinConf = await bitcoinConfFile.read().once()

    if (!bitcoinConf?.raw) return {}

    const { i2psam, i2pacceptincoming } = bitcoinConf.raw

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
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const { i2psam, ...confInput } = input

    await bitcoinConfFile.merge(effects, {
      raw: {
        i2psam: i2psam.selection === 'enabled' ? i2PSamAddress : undefined,
        i2pacceptincoming:
          i2psam.selection === 'enabled' && i2psam.value.i2pacceptincoming,
      },
      ...confInput,
    })
  },
)
