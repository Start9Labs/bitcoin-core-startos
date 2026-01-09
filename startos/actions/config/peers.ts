import { T } from '@start9labs/start-sdk'
import { bitcoinConfFile, shape } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import { bitcoinConfDefaults, getExteralAddresses } from '../../utils'
import { i2pdConfDefaults, i2pdConfFile } from '../../fileModels/i2pd.conf'

const { onlynet, v2transport, externalip, addnode, connect } =
  bitcoinConfDefaults
const { Value, Variants, List, InputSpec } = sdk
const validNets = ['ipv4', 'ipv6', 'onion', 'i2p', 'cjdns'] as const
type ValidNets = (typeof validNets)[number]

const peerSpec = sdk.InputSpec.of({
  onlynet: Value.multiselect({
    name: 'Onlynet',
    description:
      'Make automatic outbound connections only to network <net> (ipv4, ipv6, onion, i2p, cjdns). Inbound and manual connections are not affected by this option',
    values: {
      ipv4: 'ipv4',
      ipv6: 'ipv6',
      onion: 'onion (Tor)',
      i2p: 'i2p',
      cjdns: 'cjdns',
    },
    default: [],
  }),
  v2transport: Value.toggle({
    name: 'Use V2 P2P Transport Protocol',
    default: v2transport,
    description:
      'Enable or disable the use of BIP324 V2 P2P transport protocol.',
  }),
  externalip: getExteralAddresses(),
  i2p: Value.toggle({
    name: 'Enable I2P',
    default: false,
    description: 'Enable or disable I2P networking support.',
  }),
  i2psettings: Value.object(
    {
      name: 'I2P Advanced Settings',
      description: 'Configure I2P related settings.',      
    },
    sdk.InputSpec.of({
      i2pacceptincoming: Value.toggle({
        name: 'Accept Incoming I2P Connections',
        default: true,
        description: 'Accept inbound I2P connections.',
      }),
      loglevel: Value.select({
        name: 'Log Level',
        description: 'Set the logging level for the I2P router.',
        values: {
          none: 'none',
          critical: 'critical (default)',
          error: 'error',
          warn: 'warning',
          info: 'info',
          debug: 'debug',
        },
        default: 'critical',
      }),
      bandwidth: Value.select({
        name: 'Bandwidth',
        description: 'Bandwidth configuration for I2P router.',
        values: {
          L: '32 KB/sec (L, default)',
          O: '256 KB/sec (O)',
          P: '2048 KB/sec (P)',
        },
        default: 'L',
      }),
      share: Value.number({
        name: 'Share (%)',
        description:
          'Max % of bandwidth limit for transit. 0-100 (default: 100)',
        min: 0,
        max: 100,
        default: 100,
        integer: true,
        required: true,
        units: '%',
      }),
      notransit: Value.toggle({
        name: 'Disable Transit',
        default: false,
        description:
          'Router will not accept transit tunnels, disabling transit traffic completely.',
      }),
      floodfill: Value.toggle({
        name: 'Floodfill mode',
        default: false,
        description:
          'Router will participate in the distributed network database as a floodfill peer.',
        warning: 'Note: this mode uses much more network connections and CPU!',
      }),
      transittunnels: Value.number({
        name: 'Transit Tunnels Limit',
        description:
          'Maximum active transit sessions (default: 10000). This value is doubled if floodfill mode is enabled!',
        default: 10000,
        min: 0,
        integer: true,
        required: true,
      }),
    }),
  ),
  connectpeer: Value.union({
    name: 'Connect Peer',
    default: 'addnode',
    variants: Variants.of({
      connect: {
        name: 'Connect',
        spec: InputSpec.of({
          peers: Value.list(
            List.text(
              {
                name: 'Connect Nodes',
                minLength: 1,
                description:
                  'Add addresses of nodes for Bitcoin to EXCLUSIVELY connect to.',
              },
              {
                patterns: [
                  {
                    regex:
                      '(^s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?:[0-9]{1,5}))s*$)|(^s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*.?:[0-9]{1,5})s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?:[0-9]{1,5}s*$)',
                    description:
                      "Must be either a domain name, or an IPv4 or IPv6 address. Be sure to include the port number, but do not include protocol scheme (eg 'http://').",
                  },
                ],
              },
            ),
          ),
        }),
      },
      addnode: {
        name: 'Add Node',
        spec: InputSpec.of({
          peers: Value.list(
            List.text(
              {
                name: 'Add Nodes',
                description:
                  'Add addresses of nodes for Bitcoin to connect with in addition to default nodes.',
              },
              {
                inputmode: 'text',
                patterns: [
                  {
                    regex:
                      '(^s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?:[0-9]{1,5}))s*$)|(^s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*.?:[0-9]{1,5})s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?:[0-9]{1,5}s*$)',
                    description:
                      "Must be either a domain name, or an IPv4 or IPv6 address. Be sure to include the port number, but do not include protocol scheme (eg 'http://').",
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
    name: 'Peer Settings',
    description: 'Edit the Peer settings in bitcoin.conf',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
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
    i2p: bitcoinConf.i2psam !== undefined,
    i2psettings: {
      i2pacceptincoming: bitcoinConf.i2pacceptincoming,
      loglevel: i2pdConf.loglevel as 'none' | 'critical' | 'error' | 'warn' | 'info' | 'debug',
      bandwidth: i2pdConf.bandwidth as 'L' | 'O' | 'P',
      share: i2pdConf.share,
      notransit: i2pdConf.notransit,
      floodfill: i2pdConf.floodfill,
      transittunnels: i2pdConf.limits.transittunnels,
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
    i2psam: input.i2p ? '127.0.0.1:7656' : undefined,
    i2pacceptincoming: input.i2psettings.i2pacceptincoming,
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

  await i2pdConfFile.merge(effects, {
    loglevel: input.i2psettings.loglevel,
    bandwidth: input.i2psettings.bandwidth,
    share: input.i2psettings.share,
    notransit: input.i2psettings.notransit,
    floodfill: input.i2psettings.floodfill,
    limits: {
      transittunnels: input.i2psettings.transittunnels,
    },
  })
}

type peerSpec = typeof peerSpec._TYPE
type PartialPeerSpec = typeof peerSpec._PARTIAL
