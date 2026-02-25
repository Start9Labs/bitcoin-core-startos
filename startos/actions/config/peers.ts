import { bitcoinConfFile, fullConfigSpec } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import { bitcoinConfDefaults as d, i2PSamAddress } from '../../utils'
import { i2pdConfDefaults, i2pdConfFile } from '../../fileModels/i2pd.conf'
import { i18n } from '../../i18n'

const { Value, Variants, InputSpec } = sdk

// @Claude these types also exist bitcoin.conf.ts. How can we abstract?
const validNets = ['ipv4', 'ipv6', 'onion', 'i2p', 'cjdns'] as const
type ValidNets = (typeof validNets)[number]

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
    })
    .add({
      i2psam: Value.union({
        name: i18n('I2P SAM Proxy'),
        description: i18n('Select how to connect to the I2P network.'),
        default: 'disabled',
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
              advanced: Value.object(
                {
                  name: i18n('Advanced I2P Daemon Settings'),
                  description: i18n(
                    'Configure advanced settings for the embedded I2P daemon.',
                  ),
                },
                sdk.InputSpec.of({
                  loglevel: Value.select({
                    name: i18n('Log Level'),
                    description: i18n(
                      'Set the logging level for the I2P router.',
                    ),
                    values: {
                      none: i18n('none'),
                      critical: i18n('critical (default)'),
                      error: i18n('error'),
                      warn: i18n('warning'),
                      info: i18n('info'),
                      debug: i18n('debug'),
                    },
                    default: 'critical',
                  }),
                  enablewebconsole: Value.toggle({
                    name: i18n('Enable Web Console'),
                    default: false,
                    description: i18n(
                      'Enable the web console for the embedded I2P daemon.',
                    ),
                  }),
                  bandwidth: Value.select({
                    name: i18n('Bandwidth'),
                    description: i18n(
                      'Bandwidth configuration for I2P router.',
                    ),
                    values: {
                      L: i18n('32 KB/sec (L, default)'),
                      O: i18n('256 KB/sec (O)'),
                      P: i18n('2048 KB/sec (P)'),
                    },
                    default: 'L',
                  }),
                  share: Value.number({
                    name: i18n('Share (%)'),
                    description: i18n(
                      'Max % of bandwidth limit for transit. 0-100 (default: 100)',
                    ),
                    min: 0,
                    max: 100,
                    default: 100,
                    integer: true,
                    required: true,
                    units: '%',
                  }),
                  notransit: Value.toggle({
                    name: i18n('Disable Transit'),
                    default: false,
                    description: i18n(
                      'Router will not accept transit tunnels, disabling transit traffic completely.',
                    ),
                  }),
                  floodfill: Value.toggle({
                    name: i18n('Floodfill mode'),
                    default: false,
                    description: i18n(
                      'Router will participate in the distributed network database as a floodfill peer.',
                    ),
                    warning: i18n(
                      'Note: this mode uses much more network connections and CPU!',
                    ),
                  }),
                  transittunnels: Value.number({
                    name: i18n('Transit Tunnels Limit'),
                    description: i18n(
                      'Maximum active transit sessions (default: 10000). This value is doubled if floodfill mode is enabled!',
                    ),
                    default: 10000,
                    min: 0,
                    integer: true,
                    required: true,
                  }),
                }),
              ),
            }),
          },
        }),
      }),
    }),
  // optionally pre-fill the input form
  async ({ effects }) => {
    const bitcoinConf = await bitcoinConfFile.read().once()

    if (!bitcoinConf?.raw) return {}

    const { i2psam, i2pacceptincoming } = bitcoinConf.raw

    const i2pdConf = (await i2pdConfFile.read().once()) ?? i2pdConfDefaults

    return {
      ...bitcoinConf,
      i2psam:
        i2psam === undefined
          ? { selection: 'disabled' as const, value: {} }
          : {
              selection: 'enabled' as const,
              value: {
                i2pacceptincoming: i2pacceptincoming ?? true,
                advanced: {
                  loglevel: i2pdConf.loglevel as
                    | 'none'
                    | 'critical'
                    | 'error'
                    | 'warn'
                    | 'info'
                    | 'debug',
                  enablewebconsole: i2pdConf.http.enabled,
                  bandwidth: i2pdConf.bandwidth as 'L' | 'O' | 'P',
                  share: i2pdConf.share,
                  notransit: i2pdConf.notransit,
                  floodfill: i2pdConf.floodfill,
                  transittunnels: i2pdConf.limits.transittunnels,
                },
              },
            },
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const { i2psam } = input

    await bitcoinConfFile.merge(effects, {
      raw: {
        i2psam: i2psam.selection === 'enabled' ? i2PSamAddress : undefined,
        i2pacceptincoming:
          i2psam.selection === 'enabled' && i2psam.value.i2pacceptincoming,
      },
      ...input,
    })

    if (i2psam.selection === 'enabled') {
      const {
        loglevel,
        bandwidth,
        share,
        notransit,
        floodfill,
        enablewebconsole,
        transittunnels,
      } = i2psam.value.advanced

      await i2pdConfFile.merge(effects, {
        loglevel,
        bandwidth,
        share,
        notransit,
        floodfill,
        http: {
          enabled: enablewebconsole,
        },
        limits: {
          transittunnels,
        },
      })
    }
  },
)
