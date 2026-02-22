import { FileHelper, z } from '@start9labs/start-sdk'
import {
  i2PSamAddress,
  peerPortExternal,
  peerPortInternal,
  rpcallowip,
  rpcallowipPruned,
  rpcbind,
  rpcbindPruned,
  rpccookiefile,
} from '../utils'
import { sdk } from '../sdk'

// INI coercion helpers: INI parsing returns strings, with duplicate keys producing arrays.
// Each uses .catch(undefined) to match the old optional(t) = t.optional().onMismatch(undefined)

const iniString = z
  .union([z.array(z.string()).transform((a) => a.at(-1)!), z.string()])
  .optional()
  .catch(undefined)

const iniStringArray = z
  .union([z.array(z.string()), z.string().transform((s) => [s])])
  .optional()
  .catch(undefined)

const iniNumber = z
  .union([
    z.array(z.string()).transform((a) => Number(a.at(-1))),
    z.string().transform(Number),
    z.number(),
  ])
  .optional()
  .catch(undefined)

const iniBoolean = z
  .union([
    z.string().transform((s) => !!Number(s)),
    z.number().transform((n) => !!n),
    z.boolean(),
  ])
  .optional()
  .catch(undefined)

const onlyNetOption = z.enum(['ipv4', 'ipv6', 'onion', 'i2p', 'cjdns'])

export const shape = z.object({
  // RPC enforced
  rpcbind: z.enum([rpcbind, rpcbindPruned]).catch(rpcbind),
  rpcallowip: z.enum([rpcallowip, rpcallowipPruned]).catch(rpcallowip),
  rpcuser: z.undefined().catch(undefined),
  rpcpassword: z.undefined().catch(undefined),
  rpccookiefile: z.literal(rpccookiefile).catch(rpccookiefile),
  // Peers enforced
  listen: z.literal(true).catch(true),
  bind: z
    .literal(`0.0.0.0:${peerPortInternal}`)
    .catch(`0.0.0.0:${peerPortInternal}`),
  whitebind: z
    .literal(`0.0.0.0:${peerPortExternal}`)
    .catch(`0.0.0.0:${peerPortExternal}`),
  // Mempool enforced
  mempoolfullrbf: z.undefined().catch(undefined),

  // RPC
  rpcauth: iniStringArray,
  rpcservertimeout: iniNumber,
  rpcthreads: iniNumber,
  rpcworkqueue: iniNumber,

  // Mempool
  persistmempool: iniBoolean,
  maxmempool: iniNumber,
  mempoolexpiry: iniNumber,
  datacarrier: iniBoolean,
  datacarriersize: iniNumber,
  permitbaremultisig: iniBoolean,

  // Peers
  onlynet: z
    .union([onlyNetOption, z.array(onlyNetOption)])
    .optional()
    .catch(undefined),
  externalip: iniString,
  whitelist: iniStringArray,
  v2transport: iniBoolean,
  connect: iniStringArray,
  addnode: iniStringArray,
  i2psam: z.literal(i2PSamAddress).optional().catch(undefined),
  i2pacceptincoming: iniBoolean,

  // Wallet
  disablewallet: iniBoolean,
  avoidpartialspends: iniBoolean,
  discardfee: iniNumber,

  // ZMQ
  zmqpubrawblock: iniString,
  zmqpubhashblock: iniString,
  zmqpubrawtx: iniString,
  zmqpubhashtx: iniString,
  zmqpubsequence: iniString,

  // Performance Tuning
  dbcache: iniNumber,
  dbbatchsize: iniNumber,
  assumevalid: iniString,

  // Other
  blocknotify: iniString,
  prune: iniNumber,
  coinstatsindex: iniBoolean,
  txindex: iniBoolean,
  peerbloomfilters: iniBoolean,
  blockfilterindex: z
    .union([
      z.literal('basic'),
      z
        .union([
          z.string().transform((s) => !!Number(s)),
          z.number().transform((n) => !!n),
          z.boolean(),
        ]),
    ])
    .optional()
    .catch(undefined),
  peerblockfilters: iniBoolean,
})

function onWrite(a: unknown): any {
  if (a && typeof a === 'object') {
    if (Array.isArray(a)) {
      return a.map(onWrite)
    }
    return Object.fromEntries(
      Object.entries(a).map(([k, v]) => [k, onWrite(v)]),
    )
  } else if (typeof a === 'boolean') {
    return a ? 1 : 0
  }
  return a
}

export const bitcoinConfFile = FileHelper.ini(
  {
    base: sdk.volumes.main,
    subpath: '/bitcoin.conf',
  },
  shape,
  { bracketedArray: false },
  {
    onRead: (a) => a,
    onWrite,
  },
)
