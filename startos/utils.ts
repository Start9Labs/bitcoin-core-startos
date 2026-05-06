import { sdk } from './sdk'

export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'
export const zmqInterfaceId = 'zmq'

export const zmqPortBlock = 28332
export const zmqPortTransaction = 28333

export const peerPortExternal = 8333
export const peerPortInternal = 58333

export const rpcPort = 8332
export const rpcPortPruned = 58332

export const rpcbind = `0.0.0.0:${rpcPort}`
export const rpcbindPruned = `127.0.0.1:${rpcPortPruned}`

export const rpcallowip = '0.0.0.0/0'
export const rpcallowipPruned = '127.0.0.1/32'

export const rootDir = '/root/.bitcoin'
export const rpccookiefile = '.cookie'

export const i2pSamPort = 7656
export const i2pUiPort = 7070
export const i2pControlPort = 7650

export const i2PSamAddress = `127.0.0.1:${i2pSamPort}`

export const bitcoinMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: rootDir,
  readonly: false,
})

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

/** RPC connection args shared by bitcoin-cli and shell-script wrappers. */
export function rpcArgs(opts: { prune: boolean }): string[] {
  return [
    `-conf=${rootDir}/bitcoin.conf`,
    `-rpccookiefile=${rootDir}/.cookie`,
    `-rpcport=${opts.prune ? rpcPortPruned : rpcPort}`,
  ]
}

/** Full bitcoin-cli command prefix for actions running in temp subcontainers. */
export function bitcoinCliArgs(opts: { prune: boolean }): string[] {
  return ['bitcoin-cli', ...rpcArgs(opts)]
}

export const zmqBundle = {
  zmqpubrawblock: `tcp://0.0.0.0:${zmqPortBlock}`,
  zmqpubhashblock: `tcp://0.0.0.0:${zmqPortBlock}`,
  zmqpubrawtx: `tcp://0.0.0.0:${zmqPortTransaction}`,
  zmqpubhashtx: `tcp://0.0.0.0:${zmqPortTransaction}`,
  zmqpubsequence: `tcp://0.0.0.0:${zmqPortTransaction}`,
}
