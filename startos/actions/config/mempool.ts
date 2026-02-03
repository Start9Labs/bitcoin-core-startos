import { T } from '@start9labs/start-sdk'
import { bitcoinConfFile, shape } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import { bitcoinConfDefaults } from '../../utils'
import { i18n } from '../../i18n'

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
    name: i18n('Persist Mempool'),
    default: persistmempool,
    description: i18n('Save the mempool on shutdown and load on restart.'),
  }),
  maxmempool: Value.number({
    name: i18n('Max Mempool Size'),
    description: i18n('Keep the transaction memory pool below <n> megabytes.'),
    required: false,
    default: maxmempool,
    min: 1,
    integer: true,
    units: 'MiB',
    placeholder: maxmempool.toString(),
  }),
  mempoolexpiry: Value.number({
    name: i18n('Mempool Expiration'),
    description: i18n(
      'Do not keep transactions in the mempool longer than <n> hours.',
    ),
    required: false,
    default: mempoolexpiry,
    min: 1,
    integer: true,
    units: i18n('Hr'),
    placeholder: mempoolexpiry.toString(),
  }),
  permitbaremultisig: Value.toggle({
    name: i18n('Permit Bare Multisig'),
    default: permitbaremultisig,
    description: i18n('Relay non-P2SH multisig transactions'),
  }),
  datacarrier: Value.toggle({
    name: i18n('Relay OP_RETURN Transactions'),
    default: datacarrier,
    description: i18n('Relay transactions with OP_RETURN outputs'),
  }),
  datacarriersize: Value.number({
    name: i18n('Max OP_RETURN Size'),
    description: i18n('Maximum size of data in OP_RETURN outputs to relay'),
    required: false,
    default: datacarriersize,
    min: 0,
    max: 10_000,
    integer: true,
    units: i18n('bytes'),
    placeholder: datacarriersize.toString(),
  }),
})

export const mempoolConfig = sdk.Action.withInput(
  // id
  'mempool-config',

  // metadata
  async ({ effects }) => ({
    name: i18n('Mempool Settings'),
    description: i18n('Edit the Mempool settings in bitcoin.conf'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
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
