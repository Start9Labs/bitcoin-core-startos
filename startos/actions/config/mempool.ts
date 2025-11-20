import { T } from '@start9labs/start-sdk'
import { bitcoinConfFile, shape } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import { bitcoinConfDefaults } from '../../utils'

const {
  persistmempool,
  maxmempool,
  mempoolexpiry,
  permitbaremultisig,
  datacarrier,
  datacarriersize,
} = bitcoinConfDefaults

const { Value } = sdk

const mempoolSpec = sdk.InputSpec.of({
  persistmempool: Value.toggle({
    name: 'Persist Mempool',
    default: persistmempool,
    description: 'Save the mempool on shutdown and load on restart.',
  }),
  maxmempool: Value.number({
    name: 'Max Mempool Size',
    description: 'Keep the transaction memory pool below <n> megabytes.',
    required: false,
    default: maxmempool,
    min: 1,
    integer: true,
    units: 'MiB',
    placeholder: maxmempool.toString(),
  }),
  mempoolexpiry: Value.number({
    name: 'Mempool Expiration',
    description:
      'Do not keep transactions in the mempool longer than <n> hours.',
    required: false,
    default: mempoolexpiry,
    min: 1,
    integer: true,
    units: 'Hr',
    placeholder: mempoolexpiry.toString(),
  }),
  permitbaremultisig: Value.toggle({
    name: 'Permit Bare Multisig',
    default: permitbaremultisig,
    description: 'Relay non-P2SH multisig transactions',
  }),
  datacarrier: Value.toggle({
    name: 'Relay OP_RETURN Transactions',
    default: datacarrier,
    description: 'Relay transactions with OP_RETURN outputs',
  }),
  datacarriersize: Value.number({
    name: 'Max OP_RETURN Size',
    description: 'Maximum size of data in OP_RETURN outputs to relay',
    required: false,
    default: datacarriersize,
    min: 0,
    max: 10_000,
    integer: true,
    units: 'bytes',
    placeholder: datacarriersize.toString(),
  }),
})

export const mempoolConfig = sdk.Action.withInput(
  // id
  'mempool-config',

  // metadata
  async ({ effects }) => ({
    name: 'Mempool Settings',
    description: 'Edit the Mempool settings in bitcoin.conf',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),

  // form input specification
  mempoolSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(effects, input),
)

async function read(effects: any): Promise<PartialMempoolSpec> {
  const bitcoinConf = await bitcoinConfFile.read().const(effects)
  if (!bitcoinConf) return {}

  const mempoolSettings: PartialMempoolSpec = {
    maxmempool: bitcoinConf.maxmempool,
    mempoolexpiry: bitcoinConf.mempoolexpiry,
    datacarriersize: bitcoinConf.datacarriersize,
    persistmempool: bitcoinConf.persistmempool,
    datacarrier: bitcoinConf.datacarrier,
    permitbaremultisig: bitcoinConf.permitbaremultisig,
  }
  return mempoolSettings
}

async function write(effects: T.Effects, input: MempoolSpec) {
  const mempoolSettings = {
    persistmempool: input.persistmempool,
    datacarrier: input.datacarrier,
    permitbaremultisig: input.permitbaremultisig,
    maxmempool: input.maxmempool || maxmempool,
    mempoolexpiry: input.mempoolexpiry || mempoolexpiry,
    datacarriersize: input.datacarriersize || datacarriersize,
  }

  await bitcoinConfFile.merge(effects, mempoolSettings)
}

type MempoolSpec = typeof mempoolSpec._TYPE
type PartialMempoolSpec = typeof mempoolSpec._PARTIAL
