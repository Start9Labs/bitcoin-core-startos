import { sdk } from '../../sdk'
import { utils } from '@start9labs/start-sdk'
import * as diskusage from 'diskusage'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import {
  bitcoinConfDefaults as d,
  rpcallowip,
  rpcallowipPruned,
  rpcbind,
  rpcbindPruned,
  zmqBundle,
} from '../../utils'
import { storeJson } from '../../fileModels/store.json'
import { i18n } from '../../i18n'

const { InputSpec, Value } = sdk

const diskUsage = utils.once(() => diskusage.check('/'))
const archivalMin = 900_000_000_000

const configSpec = sdk.InputSpec.of({
  zmqEnabled: Value.toggle({
    name: i18n('ZeroMQ Enabled'),
    description: i18n(
      'The ZeroMQ interface is useful for some applications which might require data related to block and transaction events from Bitcoin Core. For example, LND requires ZeroMQ be enabled for LND to get the latest block data',
    ),
    default: true,
  }),
  txindex: Value.dynamicToggle(async ({ effects }) => {
    const disk = await diskUsage()
    return {
      name: i18n('Transaction Index'),
      default: disk.total >= archivalMin,
      description: i18n(
        'By enabling Transaction Index (txindex) Bitcoin Core will build a complete transaction index. This allows Bitcoin Core to access any transaction with commands like `getrawtransaction`.',
      ),
      disabled:
        disk.total < archivalMin ? i18n('Not enough disk space') : false,
    }
  }),
  blocknotify: Value.text({
    name: i18n('Block Notify'),
    required: false,
    default: null,
    description: i18n(
      'Execute an arbitrary command when the best block changes',
    ),
  }),
  coinstatsindex: Value.toggle({
    name: i18n('Coinstats Index'),
    description: i18n(
      'Enabling Coinstats Index reduces the time for the gettxoutsetinfo RPC to complete at the cost of using additional disk space',
    ),
    default: d.coinstatsindex,
  }),
  wallet: Value.object(
    { name: i18n('Wallet'), description: i18n('Wallet Settings') },
    InputSpec.of({
      enable: Value.toggle({
        name: i18n('Enable Wallet'),
        description: i18n('Load the wallet and enable wallet RPC calls.'),
        default: !d.disablewallet,
      }),
      avoidpartialspends: Value.toggle({
        name: i18n('Avoid Partial Spends'),
        description: i18n(
          'Group outputs by address, selecting all or none, instead of selecting on a per-output basis. This improves privacy at the expense of higher transaction fees.',
        ),
        default: d.avoidpartialspends,
      }),
      discardfee: Value.number({
        name: i18n('Discard Change Tolerance'),
        description: i18n(
          'The fee rate (in BTC/kB) that indicates your tolerance for discarding change by adding it to the fee.',
        ),
        required: false,
        default: null,
        min: 0,
        max: 0.01,
        integer: false,
        units: i18n('BTC/kB'),
        placeholder: String(d.discardfee),
      }),
    }),
  ),
  prune: Value.dynamicNumber(async ({ effects }) => {
    const disk = await diskUsage()

    return {
      name: i18n('Pruning'),
      description: i18n(
        'Set the maximum size of the blockchain you wish to store on disk. If your disk is larger than .9TB this value can be set to zero (0) to maintain a full archival node.',
      ),
      warning: i18n(
        'If your node is already pruned increasing this value will require re-syncing your node. Switching from a full archival node to pruned will disable txindex (if enabled)',
      ),
      placeholder:
        disk.total < archivalMin
          ? i18n('Leave blank for full archival')
          : i18n('Enter max blockchain size'),
      required: disk.total < archivalMin,
      default: disk.total < archivalMin ? 550 : null,
      integer: true,
      units: 'MiB',
      min: 1,
      max: Math.floor((disk.total * 0.75) / (1024 * 1024)),
    }
  }),
  dbcache: Value.number({
    name: i18n('Database Cache'),
    description: i18n(
      'How much RAM to allocate for caching the TXO set. Higher values improve syncing performance, but may result in some re-work in the event of an ungraceful shutdown. 4-7GB is high enough to get most of the peformance benefit during IBD. Consider reducing this setting for lower resource devices (or a device with less available RAM)',
    ),
    required: false,
    default: null,
    min: 0,
    integer: true,
    units: 'MiB',
    placeholder: String(d.dbcache),
  }),
  dbbatchsize: Value.number({
    name: i18n('Database Batch'),
    description: i18n(
      'Maximum database write batch size in bytes. Higher values will speed up the critical sections when the utxo set is written to disk from memory in big batches.',
    ),
    required: false,
    default: null,
    min: 0,
    integer: true,
    units: i18n('Bytes'),
    placeholder: String(d.dbbatchsize),
  }),
  blockfilters: Value.object(
    {
      name: i18n('Block Filters'),
      description: i18n(
        'Settings for storing and serving compact block filters',
      ),
    },
    InputSpec.of({
      blockfilterindex: Value.toggle({
        name: i18n('Compute Compact Block Filters (BIP158)'),
        description: i18n(
          "Generate Compact Block Filters during initial sync (IBD) to enable 'getblockfilter' RPC. This is useful if dependent services need block filters to efficiently scan for addresses/transactions etc.",
        ),
        default: !!d.blockfilterindex,
      }),
      peerblockfilters: Value.toggle({
        name: i18n('Serve Compact Block Filters to Peers (BIP157)'),
        description: i18n(
          "Serve Compact Block Filters as a peer service to other nodes on the network. This is useful if you wish to connect an SPV client to your node to make it efficient to scan transactions without having to download all block data.  'Compute Compact Block Filters (BIP158)' is required.",
        ),
        default: d.peerblockfilters,
      }),
    }),
  ),
  peerbloomfilters: Value.toggle({
    name: i18n('Serve Bloom Filters to Peers'),
    description: i18n(
      'Peers have the option of setting filters on each connection they make after the version handshake has completed. Bloom filters are for clients implementing SPV (Simplified Payment Verification) that want to check that block headers  connect together correctly, without needing to verify the full blockchain.  The client must trust that the transactions in the chain are in fact valid.  It is highly recommended AGAINST using for anything except Bisq integration.',
    ),
    warning: i18n(
      'This is ONLY for use with Bisq integration, please use Block Filters for all other applications.',
    ),
    default: d.peerbloomfilters,
  }),
  enableIpc: Value.dynamicToggle(async ({ effects }) => {
    let ipcEnabled = await storeJson.read((s) => s.enableIpc).once()
    return {
      name: i18n('Enable IPC'),
      description: i18n(
        'Enable inter-process communication (IPC) via Unix socket. This allows other services to communicate with Bitcoin Core using a high-performance local socket connection. The socket path will be displayed in Runtime Information.',
      ),
      warning: ipcEnabled
        ? null
        : i18n(
            'IPC is an experimental feature. Only enable this if you know what you are doing with the IPC socket. An example use case would be Stratum v2 mining services.',
          ),
      default: false,
    }
  }),
})

export const otherConfig = sdk.Action.withInput(
  // id
  'other-config',

  // metadata
  async ({ effects }) => ({
    name: i18n('Other Settings'),
    description: i18n('Edit more values in bitcoin.conf'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // form input specification
  configSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const bitcoinConf = await bitcoinConfFile.read().once()
    const enableIpc = await storeJson.read((s) => s.enableIpc).once()

    if (!bitcoinConf)
      return {
        enableIpc: enableIpc ?? false,
      }

    const {
      zmqpubhashblock,
      zmqpubhashtx,
      zmqpubrawblock,
      zmqpubrawtx,
      zmqpubsequence,
      txindex,
      coinstatsindex,
      disablewallet,
      avoidpartialspends,
      discardfee,
      blocknotify,
      prune,
      dbcache,
      blockfilterindex,
      peerblockfilters,
      peerbloomfilters,
    } = bitcoinConf

    return {
      zmqEnabled: !!(
        zmqpubhashblock &&
        zmqpubhashtx &&
        zmqpubrawblock &&
        zmqpubrawtx &&
        zmqpubsequence
      ),
      txindex,
      coinstatsindex,
      wallet: {
        enable: !disablewallet,
        avoidpartialspends,
        discardfee,
      },
      blocknotify,
      prune,
      dbcache,
      blockfilters: {
        blockfilterindex: blockfilterindex === 'basic',
        peerblockfilters,
      },
      peerbloomfilters,
      enableIpc: enableIpc ?? false,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const {
      prune,
      wallet,
      txindex,
      coinstatsindex,
      peerbloomfilters,
      blockfilters,
      blocknotify,
      dbcache,
      zmqEnabled,
    } = input

    await bitcoinConfFile.merge(effects, {
      // RPC
      rpcbind: prune ? rpcbindPruned : rpcbind,
      rpcallowip: prune ? rpcallowipPruned : rpcallowip,

      // Wallet
      disablewallet: !wallet.enable,
      avoidpartialspends: wallet.avoidpartialspends,
      discardfee: wallet.discardfee || undefined,

      // Other
      txindex: prune ? false : txindex,
      coinstatsindex,
      peerbloomfilters,
      peerblockfilters: blockfilters.peerblockfilters,
      blockfilterindex: blockfilters.blockfilterindex ? 'basic' : false,
      blocknotify: blocknotify || undefined,
      prune: prune || undefined,
      dbcache: dbcache || undefined,
      ...(zmqEnabled ? zmqBundle : {}),
    })

    await storeJson.merge(effects, {
      enableIpc: input.enableIpc,
    })
  },
)
