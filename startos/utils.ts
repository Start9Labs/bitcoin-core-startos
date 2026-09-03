import { sdk } from './sdk'

// Host ids (the `sdk.MultiHost.of` groups) — distinct from the interface ids
// exported on them. Used for `sdk.host.getOwn`/`get` lookups.
export const rpcHostId = 'rpc'
export const peerHostId = 'peer'
export const zmqHostId = 'zmq'
export const i2pConsoleHostId = 'i2p-console'

/**
 * The whitelisted p2p listener, for services on the LXC bridge. Bound without
 * an exported interface, so it is reachable only over the bridge — a dependent
 * resolves it with `sdk.host.getBridgeAddress({ hostId: peerLocalHostId,
 * internalPort: peerPortLocal })`.
 *
 * A dependent that fetches blocks over p2p (electrs, NBXplorer) must use this
 * host rather than `peerHostId`: the latter maps onto the plain `bind`, where
 * it lands with no permissions alongside public inbound peers.
 */
export const peerLocalHostId = 'peer-local'

// Interface ids (the exported service interfaces on the hosts above).
export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'
export const zmqBlockInterfaceId = 'zmq-block'
export const zmqTxInterfaceId = 'zmq-tx'

export const zmqPortBlock = 28332
export const zmqPortTransaction = 28333

/** Host-side port the public `peer` binding prefers — the canonical p2p port. */
export const peerPortExternal = 8333
/** Container port bitcoind plain-binds (`bind`); the `peer` binding maps here. */
export const peerPortInternal = 58333
/** Container port bitcoind whitelists (`whitebind`); the `peer-local` binding maps here. */
export const peerPortLocal = 58334

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
export const i2pSocksPort = 4447

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

export const ipcSocketPath = `unix:${rootDir}/ipc/bitcoin-core.sock`

/** RPC connection args shared by bitcoin-cli and shell-script wrappers. */
export type ChainTip = {
  height: number
  hash: string
  branchlen: number
  status:
    | 'active'
    | 'invalid'
    | 'headers-only'
    | 'valid-headers'
    | 'valid-fork'
    | 'unknown'
}

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
