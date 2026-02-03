import { T } from '@start9labs/start-sdk'
import { bitcoinConfFile, shape } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import {
  bitcoinConfDefaults,
  embeddedI2PSamAddress,
  getExteralAddresses,
} from '../../utils'
import { i2pdConfDefaults, i2pdConfFile } from '../../fileModels/i2pd.conf'
import { ipv4 } from '@start9labs/start-sdk/base/lib/util/regexes'
import { i18n } from '../../i18n'

const { onlynet, v2transport, externalip, addnode, connect } =
  bitcoinConfDefaults
const { Value, Variants, List, InputSpec } = sdk
const validNets = ['ipv4', 'ipv6', 'onion', 'i2p', 'cjdns'] as const
type ValidNets = (typeof validNets)[number]

const peerSpec = sdk.InputSpec.of({
  onlynet: Value.multiselect({
    name: i18n('Onlynet'),
    description: i18n(
      'Make automatic outbound connections only to network <net> (ipv4, ipv6, onion, i2p, cjdns). Inbound and manual connections are not affected by this option',
    ),
    values: {
      ipv4: i18n('ipv4'),
      ipv6: i18n('ipv6'),
      onion: i18n('onion (Tor)'),
      i2p: i18n('i2p'),
      cjdns: i18n('cjdns'),
    },
    default: [],
  }),
  v2transport: Value.toggle({
    name: i18n('Use V2 P2P Transport Protocol'),
    default: v2transport,
    description: i18n(
      'Enable or disable the use of BIP324 V2 P2P transport protocol.',
    ),
  }),
  externalip: getExteralAddresses(),
  i2psam: Value.union({
    name: i18n('I2P SAM Proxy'),
    description: i18n('Select how to connect to the I2P network.'),
    default: 'none',
    variants: Variants.of({
      none: {
        name: i18n('Disable I2P'),
        spec: InputSpec.of({}),
      },
      embedded: {
        name: i18n('Embedded I2P Daemon (i2pd)'),
        spec: sdk.InputSpec.of({
          i2pacceptincoming: Value.toggle({
            name: i18n('Accept Incoming I2P Connections'),
            default: true,
            description: i18n(
              'Accept inbound I2P connections (effective only when I2P is enabled).',
            ),
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
                description: i18n('Set the logging level for the I2P router.'),
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
                description: i18n('Bandwidth configuration for I2P router.'),
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
      custom: {
        name: i18n('Custom I2P SAM Address'),
        spec: sdk.InputSpec.of({
          i2pacceptincoming: Value.toggle({
            name: i18n('Accept Incoming I2P Connections'),
            default: true,
            description: i18n(
              'Accept inbound I2P connections (effective only when I2P is enabled).',
            ),
          }),
          address: Value.text({
            name: i18n('I2P SAM Address'),
            description: i18n(
              'IP Address and port of an external I2P daemon SAM bridge (e.g., 192.168.1.1:7656)',
            ),
            default: '',
            required: true,
            patterns: [
              {
                description: i18n(
                  'A valid IP address and port number (e.g., 192.168.1.1:7656)',
                ),
                regex: `^${ipv4.regex.source}:[0-9]{1,5}$`,
              },
            ],
          }),
        }),
      },
    }),
  }),
  connectpeer: Value.union({
    name: i18n('Connect Peer'),
    default: 'addnode',
    variants: Variants.of({
      connect: {
        name: i18n('Connect'),
        spec: InputSpec.of({
          peers: Value.list(
            List.text(
              {
                name: i18n('Connect Nodes'),
                minLength: 1,
                description: i18n(
                  'Add addresses of nodes for Bitcoin to EXCLUSIVELY connect to.',
                ),
              },
              {
                patterns: [
                  {
                    regex:
                      '(^s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?:[0-9]{1,5}))s*$)|(^s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*.?:[0-9]{1,5})s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?:[0-9]{1,5}s*$)',
                    description: i18n(
                      "Must be either a domain name, or an IPv4 or IPv6 address. Be sure to include the port number, but do not include protocol scheme (eg 'http://').",
                    ),
                  },
                ],
              },
            ),
          ),
        }),
      },
      addnode: {
        name: i18n('Add Node'),
        spec: InputSpec.of({
          peers: Value.list(
            List.text(
              {
                name: i18n('Add Nodes'),
                description: i18n(
                  'Add addresses of nodes for Bitcoin to connect with in addition to default nodes.',
                ),
              },
              {
                inputmode: 'text',
                patterns: [
                  {
                    regex:
                      '(^s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?:[0-9]{1,5}))s*$)|(^s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*.?:[0-9]{1,5})s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?:[0-9]{1,5}s*$)',
                    description: i18n(
                      "Must be either a domain name, or an IPv4 or IPv6 address. Be sure to include the port number, but do not include protocol scheme (eg 'http://').",
                    ),
                  },
                ],
              },
            ),
          ),
        }),
      },
    }),
  }),
})

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
  peerSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(effects, input),
)

async function read(effects: any): Promise<PartialPeerSpec> {
  const bitcoinConf = await bitcoinConfFile.read().const(effects)
  const i2pdConf =
    (await i2pdConfFile.read().const(effects)) ?? i2pdConfDefaults
  if (!bitcoinConf) return {}

  const peerSettings: PartialPeerSpec = {
    onlynet: bitcoinConf.onlynet
      ? [bitcoinConf.onlynet]
          .flat()
          .filter(
            (x): x is ValidNets =>
              x !== undefined && (validNets as readonly string[]).includes(x),
          )
      : onlynet,
    i2psam:
      bitcoinConf.i2psam === undefined
        ? { selection: 'none', value: {} }
        : bitcoinConf.i2psam === embeddedI2PSamAddress
          ? {
              selection: 'embedded',
              value: {
                i2pacceptincoming: bitcoinConf.i2pacceptincoming,
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
            }
          : {
              selection: 'custom',
              value: {
                i2pacceptincoming: bitcoinConf.i2pacceptincoming,
                address: bitcoinConf.i2psam,
              },
            },
    v2transport: bitcoinConf.v2transport,
    externalip:
      bitcoinConf.externalip === undefined ? 'none' : bitcoinConf.externalip,
    connectpeer: {
      selection: bitcoinConf.connect !== undefined ? 'connect' : 'addnode',
      value: {
        peers:
          bitcoinConf.connect !== undefined
            ? [bitcoinConf.connect]
                .flat()
                .filter((x): x is string => x !== undefined)
            : [bitcoinConf.addnode]
                .flat()
                .filter((x): x is string => x !== undefined),
      },
    },
  }

  return peerSettings
}

async function write(effects: T.Effects, input: peerSpec) {
  const peerSettings = {
    i2psam:
      input.i2psam.selection === 'embedded'
        ? embeddedI2PSamAddress
        : input.i2psam.selection === 'custom'
          ? input.i2psam.value.address
          : undefined,
    i2pacceptincoming:
      input.i2psam.selection === 'embedded' ||
      input.i2psam.selection === 'custom'
        ? input.i2psam.value.i2pacceptincoming
        : true,
    v2transport: input.v2transport,
    onlynet: input.onlynet.length > 0 ? input.onlynet : onlynet,
    externalip: input.externalip !== 'none' ? input.externalip : externalip,
  }

  if (input.connectpeer.selection === 'connect') {
    Object.assign(peerSettings, { connect: input.connectpeer.value.peers })
    Object.assign(peerSettings, { addnode: addnode })
  } else if (input.connectpeer.selection === 'addnode') {
    Object.assign(peerSettings, { addnode: input.connectpeer.value.peers })
    Object.assign(peerSettings, { connect: connect })
  }

  await bitcoinConfFile.merge(effects, peerSettings)

  if (input.i2psam.selection === 'embedded') {
    await i2pdConfFile.merge(effects, {
      loglevel: input.i2psam.value.advanced.loglevel,
      bandwidth: input.i2psam.value.advanced.bandwidth,
      share: input.i2psam.value.advanced.share,
      notransit: input.i2psam.value.advanced.notransit,
      floodfill: input.i2psam.value.advanced.floodfill,
      http: {
        enabled: input.i2psam.value.advanced.enablewebconsole,
      },
      limits: {
        transittunnels: input.i2psam.value.advanced.transittunnels,
      },
    })
  }
}

type peerSpec = typeof peerSpec._TYPE
type PartialPeerSpec = typeof peerSpec._PARTIAL
