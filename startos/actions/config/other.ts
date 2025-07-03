import { sdk } from '../../sdk'
import { utils } from '@start9labs/start-sdk'
import * as diskusage from 'diskusage'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { bitcoinConfDefaults } from '../../utils'
import { T } from '@start9labs/start-sdk'

const {
  coinstatsindex,
  disablewallet,
  avoidpartialspends,
  discardfee,
  prune,
  dbcache,
  blockfilterindex,
  peerblockfilters,
  peerbloomfilters,
  blocknotify,
} = bitcoinConfDefaults

const { InputSpec, Value } = sdk
const diskUsage = utils.once(() => diskusage.check('/'))
const archivalMin = 900_000_000_000

const configSpec = sdk.InputSpec.of({
  zmqEnabled: Value.toggle({
    name: 'ZeroMQ Enabled',
    default: true,
    description:
      'The ZeroMQ interface is useful for some applications which might require data related to block and transaction events from Bitcoin Core. For example, LND requires ZeroMQ be enabled for LND to get the latest block data',
  }),
  txindex: Value.dynamicToggle(async ({ effects }) => {
    const disk = await diskUsage()
    return {
      name: 'Transaction Index',
      default: disk.total >= archivalMin,
      description:
        'By enabling Transaction Index (txindex) Bitcoin Core will build a complete transaction index. This allows Bitcoin Core to access any transaction with commands like `getrawtransaction`.',
      disabled: disk.total < archivalMin ? 'Not enough disk space' : false,
    }
  }),
  blocknotify: Value.text({
    name: 'Block Notify',
    required: false,
    default: null,
    description: 'Execute an arbitrary command when the best block changes',
  }),
  coinstatsindex: Value.toggle({
    name: 'Coinstats Index',
    default: coinstatsindex,
    description:
      'Enabling Coinstats Index reduces the time for the gettxoutsetinfo RPC to complete at the cost of using additional disk space',
  }),
  wallet: Value.object(
    { name: 'Wallet', description: 'Wallet Settings' },
    InputSpec.of({
      enable: Value.toggle({
        name: 'Enable Wallet',
        default: !!!disablewallet,
        description: 'Load the wallet and enable wallet RPC calls.',
      }),
      avoidpartialspends: Value.toggle({
        name: 'Avoid Partial Spends',
        default: !!avoidpartialspends,
        description:
          'Group outputs by address, selecting all or none, instead of selecting on a per-output basis. This improves privacy at the expense of higher transaction fees.',
      }),
      discardfee: Value.number({
        name: 'Discard Change Tolerance',
        description:
          'The fee rate (in BTC/kB) that indicates your tolerance for discarding change by adding it to the fee.',
        required: false,
        default: null,
        min: 0,
        max: 0.01,
        integer: false,
        units: 'BTC/kB',
        placeholder: '.0001',
      }),
    }),
  ),
  prune: Value.dynamicNumber(async ({ effects }) => {
    const disk = await diskUsage()

    return {
      name: 'Pruning',
      description:
        'Set the maximum size of the blockchain you wish to store on disk. If your disk is larger than .9TB this value can be set to zero (0) to maintain a full archival node.',
      warning: 'Increasing this value will require re-syncing your node.',
      placeholder: 'Enter max blockchain size',
      required: disk.total < archivalMin,
      default: disk.total < archivalMin ? 550 : null,
      integer: true,
      units: 'MiB',
      min: 0,
    }
  }),
  dbcache: Value.number({
    name: 'Database Cache',
    description:
      "How much RAM to allocate for caching the TXO set. Higher values improve syncing performance, but increase your chance of using up all your system's memory or corrupting your database in the event of an ungraceful shutdown. Set this high but comfortably below your system's total RAM during IBD, then turn down to 450 (or leave blank) once the sync completes.",
    warning:
      'WARNING: Increasing this value results in a higher chance of ungraceful shutdowns, which can leave your node unusable if it happens during the initial block download. Use this setting with caution. Be sure to set this back to the default (450 or leave blank) once your node is synced. DO NOT press the STOP button if your dbcache is large. Instead, set this number back to the default, hit save, and wait for bitcoind to restart on its own.',
    required: false,
    default: null,
    min: 0,
    integer: true,
    units: 'MiB',
    placeholder: '450',
  }),
  blockfilters: Value.object(
    {
      name: 'Block Filters',
      description: 'Settings for storing and serving compact block filters',
    },
    InputSpec.of({
      blockfilterindex: Value.toggle({
        name: 'Compute Compact Block Filters (BIP158)',
        default: !!blockfilterindex,
        description:
          "Generate Compact Block Filters during initial sync (IBD) to enable 'getblockfilter' RPC. This is useful if dependent services need block filters to efficiently scan for addresses/transactions etc.",
      }),
      peerblockfilters: Value.toggle({
        name: 'Serve Compact Block Filters to Peers (BIP157)',
        default: !!peerblockfilters,
        description:
          "Serve Compact Block Filters as a peer service to other nodes on the network. This is useful if you wish to connect an SPV client to your node to make it efficient to scan transactions without having to download all block data.  'Compute Compact Block Filters (BIP158)' is required.",
      }),
    }),
  ),
  peerbloomfilters: Value.toggle({
    name: 'Serve Bloom Filters to Peers',
    default: !!peerbloomfilters,
    description:
      'Peers have the option of setting filters on each connection they make after the version handshake has completed. Bloom filters are for clients implementing SPV (Simplified Payment Verification) that want to check that block headers  connect together correctly, without needing to verify the full blockchain.  The client must trust that the transactions in the chain are in fact valid.  It is highly recommended AGAINST using for anything except Bisq integration.',
    warning:
      'This is ONLY for use with Bisq integration, please use Block Filters for all other applications.',
  }),
})

export const config = sdk.Action.withInput(
  // id
  'config',

  // metadata
  async ({ effects }) => ({
    name: 'Other Settings',
    description: 'Edit more values in bitcoin.conf',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),

  // form input specification
  configSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(effects, input),
)

async function read(effects: any): Promise<PartialConfigSpec> {
  const bitcoinConf = await bitcoinConfFile.read().const(effects)
  if (!bitcoinConf) return {}

  return {
    zmqEnabled:
      !!bitcoinConf?.zmqpubhashblock &&
      bitcoinConf.zmqpubhashblock !== '' &&
      !!bitcoinConf?.zmqpubhashtx &&
      bitcoinConf.zmqpubhashtx !== '' &&
      !!bitcoinConf?.zmqpubrawblock &&
      bitcoinConf.zmqpubrawblock !== '' &&
      !!bitcoinConf?.zmqpubrawtx &&
      bitcoinConf.zmqpubrawtx !== '' &&
      !!bitcoinConf?.zmqpubsequence &&
      bitcoinConf.zmqpubsequence !== '',
    txindex: bitcoinConf.txindex,
    coinstatsindex: bitcoinConf.coinstatsindex,
    wallet: {
      enable: !bitcoinConf.disablewallet,
      avoidpartialspends: bitcoinConf.avoidpartialspends,
      discardfee: bitcoinConf.discardfee,
    },
    blocknotify: bitcoinConf.blocknotify,
    prune: bitcoinConf.prune,
    dbcache: bitcoinConf.dbcache,
    blockfilters: {
      blockfilterindex: bitcoinConf.blockfilterindex === ('basic' as const),
      peerblockfilters: bitcoinConf.peerblockfilters,
    },
    peerbloomfilters: bitcoinConf.peerbloomfilters,
  }
}

async function write(effects: T.Effects, input: ConfigSpec) {
  const otherConfig = {
    // RPC
    rpcbind: input.prune ? '127.0.0.1:18332' : '0.0.0.0:8332',
    rpcallowip: input.prune ? '127.0.0.1/32' : '0.0.0.0/0',

    // Wallet
    disablewallet: !input.wallet.enable,
    avoidpartialspends: input.wallet.avoidpartialspends,
    discardfee: input.wallet.discardfee || discardfee,

    // Other
    txindex: input.txindex,
    coinstatsindex: input.coinstatsindex,
    peerbloomfilters: input.peerbloomfilters,
    peerblockfilters: input.blockfilters.peerblockfilters,
    blockfilterindex: input.blockfilters.blockfilterindex
      ? ('basic' as const)
      : false,
    blocknotify: input.blocknotify ? input.blocknotify : blocknotify,
    prune: input.prune ? input.prune : prune,
    dbcache: input.dbcache ? input.dbcache : dbcache,
    zmqpubrawblock: input.zmqEnabled ? 'tcp://0.0.0.0:28332' : '',
    zmqpubhashblock: input.zmqEnabled ? 'tcp://0.0.0.0:28332' : '',
    zmqpubrawtx: input.zmqEnabled ? 'tcp://0.0.0.0:28333' : '',
    zmqpubhashtx: input.zmqEnabled ? 'tcp://0.0.0.0:28333' : '',
    zmqpubsequence: input.zmqEnabled ? 'tcp://0.0.0.0:28333' : '',
  }

  await bitcoinConfFile.merge(effects, otherConfig)
}

type ConfigSpec = typeof configSpec._TYPE
type PartialConfigSpec = typeof configSpec._PARTIAL
