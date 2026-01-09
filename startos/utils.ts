import { sdk } from './sdk'
export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'
export const zmqInterfaceId = 'zmq'
export const zmqPort = 28332
export const peerPort = 18333
export const rpcPort = 8332

export const rootDir = '/root/.bitcoin'

export const unprunedRpcbind = '0.0.0.0:8332'
export const unprunedRpcallowIp = '0.0.0.0/0'

export const prunedRpcbind = '127.0.0.1:18332'
export const prunedRpcallowip = '127.0.0.1/32'

export const embeddedI2PSamAddress = '127.0.0.1:7656'

export type GetNetworkInfo = {
  connections: number
  connections_in: number
  connections_out: number
}

export type GetBlockchainInfo = {
  chain: string
  blocks: number
  headers: number
  bestblockhash: string
  difficulty: number
  mediantime: number
  verificationprogress: number
  initialblockdownload: boolean
  chainwork: string
  size_on_disk: number
  pruned: boolean
  pruneheight?: number
  automatic_pruning?: boolean
  prune_target_size?: number
  softforks: Record<
    string,
    {
      type: string
      bip9?: {
        status: string
        bit?: number
        start_time: number
        timeout: number
        since: number
        statistics?: {
          period: number
          threshold: number
          elapsed: number
          count: number
          possible: boolean
        }
      }
      height?: number
      active: boolean
    }
  >
  warnings: string
}

export const ipcSocketPath = `unix:${rootDir}/ipc/bitcoin-core.sock`

export const bitcoinConfDefaults = {
  // RPC
  rpcbind: unprunedRpcbind,
  rpcallowip: unprunedRpcallowIp,
  rpcauth: undefined,
  rpcservertimeout: 30,
  rpcthreads: 4,
  rpcworkqueue: 16,
  rpccookiefile: '.cookie',
  whitebind: '0.0.0.0:8333',
  bind: `0.0.0.0:${peerPort}`,

  // Mempool
  persistmempool: true,
  maxmempool: 300,
  mempoolexpiry: 336,
  permitbaremultisig: true,
  datacarrier: true,
  datacarriersize: 10_000,

  // Peers
  listen: true,
  onlynet: undefined,
  externalip: undefined,
  v2transport: true,
  connect: undefined,
  addnode: undefined,
  i2psam: undefined,
  i2pacceptincoming: true,

  // Wallet
  disablewallet: false,
  avoidpartialspends: false,
  discardfee: 0.0001,

  // Other
  blocknotify: undefined,
  prune: 0,
  zmqpubrawblock: 'tcp://0.0.0.0:28332',
  zmqpubhashblock: 'tcp://0.0.0.0:28332',
  zmqpubrawtx: 'tcp://0.0.0.0:28333',
  zmqpubhashtx: 'tcp://0.0.0.0:28333',
  zmqpubsequence: 'tcp://0.0.0.0:28333',

  coinstatsindex: false,
  txindex: false,
  dbcache: 5_000,
  dbbatchsize: 33_554_432,

  peerbloomfilters: false,
  blockfilterindex: 'basic',
  peerblockfilters: false,
} as const

export function getExteralAddresses() {
  return sdk.Value.dynamicSelect(async ({ effects }) => {
    const peerInterface = await sdk.serviceInterface
      .getOwn(effects, peerInterfaceId)
      .const()

    const urls = peerInterface?.addressInfo?.public.format() || []

    if (urls.length === 0) {
      return {
        name: 'External Address',
        description:
          "Address at which your node can be reached by peers. Select 'none' if you do not want your node to be reached by peers.",
        values: { none: 'none' },
        default: 'none',
      }
    }

    const urlsWithNone = urls.reduce(
      (obj, url) => ({ ...obj, [url]: url }),
      {} as Record<string, string>,
    )

    urlsWithNone['none'] = 'none'

    return {
      name: 'External Address',
      description:
        "Address at which your node can be reached by peers. Select 'none' if you do not want your node to be reached by peers.",
      values: urlsWithNone,
      default: urls.find((u) => u.endsWith('.onion')) || '',
    }
  })
}
