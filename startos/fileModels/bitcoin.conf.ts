import { FileHelper, matches } from '@start9labs/start-sdk'
import { bitcoinConfDefaults } from '../utils'

const { anyOf, arrayOf, object } = matches

const stringArray = matches.array(matches.string)
const string = stringArray.map(([a]) => a).orParser(matches.string)
const number = string.map((a) => Number(a)).orParser(matches.number)
const natural = string.map((a) => Number(a)).orParser(matches.natural)
const boolean = number.map((a) => !!a).orParser(matches.boolean)
const literal = (val: string | number) => {
  return matches
    .literal([String(val)])
    .orParser(matches.literal(String(val)))
    .orParser(matches.literal(val))
    .map((a) => (typeof val === 'number' ? Number(a) : a))
}

const onlyNetOptions = anyOf(
  matches.literal('ipv4'),
  matches.literal('ipv6'),
  matches.literal('onion'),
  matches.literal('i2p'),
  matches.literal('cjdns'),
)

const {
  rpcbind,
  rpcallowip,
  rpcauth,
  rpcservertimeout,
  rpcthreads,
  rpcworkqueue,
  rpccookiefile,
  whitebind,
  bind,
  persistmempool,
  maxmempool,
  mempoolexpiry,
  permitbaremultisig,
  datacarrier,
  datacarriersize,
  listen,
  externalip,
  v2transport,
  connect,
  addnode,
  disablewallet,
  avoidpartialspends,
  discardfee,
  blocknotify,
  prune,
  zmqpubrawblock,
  zmqpubhashblock,
  zmqpubhashtx,
  zmqpubrawtx,
  zmqpubsequence,
  coinstatsindex,
  txindex,
  dbcache,
  dbbatchsize,
  peerbloomfilters,
  blockfilterindex,
  peerblockfilters,
} = bitcoinConfDefaults

export const shape = object({
  // RPC
  rpcbind: string.onMismatch(rpcbind),
  rpcallowip: string.onMismatch(rpcallowip),
  rpcauth: stringArray.orParser(string).optional().onMismatch(rpcauth),
  rpcservertimeout: natural.onMismatch(rpcservertimeout),
  rpcthreads: natural.onMismatch(rpcthreads),
  rpcworkqueue: natural.onMismatch(rpcworkqueue),
  rpccookiefile: literal(rpccookiefile).onMismatch(rpccookiefile),
  rpcuser: matches.literal(undefined).optional().onMismatch(undefined),
  rpcpassword: matches.literal(undefined).optional().onMismatch(undefined),

  // Mempool
  persistmempool: boolean.optional().onMismatch(persistmempool),
  maxmempool: natural.optional().onMismatch(maxmempool),
  mempoolexpiry: natural.onMismatch(mempoolexpiry),
  datacarrier: boolean.onMismatch(datacarrier),
  datacarriersize: natural.onMismatch(datacarriersize),
  permitbaremultisig: boolean.onMismatch(permitbaremultisig),

  // Peers
  listen: matches.literal(listen).onMismatch(listen),
  bind: string.optional().onMismatch(bind),
  connect: stringArray.orParser(string).optional().onMismatch(connect),
  addnode: stringArray.orParser(string).optional().onMismatch(addnode),
  onlynet: arrayOf(onlyNetOptions.optional().onMismatch(undefined)).optional(),
  v2transport: boolean.onMismatch(v2transport),
  externalip: string.optional().onMismatch(externalip),

  // Blocknotify
  blocknotify: string.optional().onMismatch(blocknotify),

  // Whitebind
  whitebind: literal(whitebind).onMismatch(whitebind),
  whitelist: stringArray.orParser(string).optional().onMismatch(undefined),

  // Pruning
  prune: natural.onMismatch(prune),

  // Performance Tuning
  dbcache: natural.onMismatch(dbcache),
  dbbatchsize: natural.onMismatch(dbbatchsize),
  assumevalid: string.optional().onMismatch('00000000000000000000611fd22f2df7c8fbd0688745c3a6c3bb5109cc2a12cb'),

  // Wallet
  disablewallet: boolean.onMismatch(disablewallet),
  avoidpartialspends: boolean.onMismatch(avoidpartialspends),
  discardfee: number.onMismatch(discardfee),

  // Zero MQ
  zmqpubrawblock: string.optional().onMismatch(zmqpubrawblock),
  zmqpubhashblock: string.optional().onMismatch(zmqpubhashblock),
  zmqpubrawtx: string.optional().onMismatch(zmqpubrawtx),
  zmqpubhashtx: string.optional().onMismatch(zmqpubhashtx),
  zmqpubsequence: string.optional().onMismatch(zmqpubsequence),

  // TxIndex
  txindex: boolean.onMismatch(txindex),

  // CoinstatsIndex
  coinstatsindex: boolean.onMismatch(coinstatsindex),

  // BIP37
  peerbloomfilters: boolean.onMismatch(peerbloomfilters),

  // BIP157
  blockfilterindex: anyOf(matches.literal('basic'), boolean)
    .optional()
    .onMismatch(blockfilterindex),
  peerblockfilters: boolean.onMismatch(peerblockfilters),
}).onMismatch(bitcoinConfDefaults)

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
    volumeId: 'main',
    subpath: '/bitcoin.conf',
  },
  shape,
  { bracketedArray: false },
  {
    onRead: (a) => a,
    onWrite,
  },
)
