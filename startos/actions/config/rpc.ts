import { bitcoinConfFile, fullConfigSpec } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import { i18n } from '../../i18n'

export const rpcConfig = sdk.Action.withInput(
  // id
  'rpc-config',

  // metadata
  async ({ effects }) => ({
    name: i18n('RPC Settings'),
    description: i18n('Edit the RPC settings in bitcoin.conf'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // form input specification
  fullConfigSpec.filter({
    rpcservertimeout: true,
    rpcthreads: true,
    rpcworkqueue: true,
  }),

  // optionally pre-fill the input form
  async ({ effects }) => bitcoinConfFile.read().once(),

  // the execution function
  ({ effects, input }) => bitcoinConfFile.merge(effects, input),
)
