import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import { bitcoinConfDefaults, nullToUndefined } from '../../utils'
import { i18n } from '../../i18n'

const { Value } = sdk
const { rpcservertimeout, rpcthreads, rpcworkqueue } = bitcoinConfDefaults

const rpcSpec = sdk.InputSpec.of({
  rpcservertimeout: Value.number({
    name: i18n('Rpc Server Timeout'),
    description: i18n(
      'Number of seconds after which an uncompleted RPC call will time out.',
    ),
    required: false,
    default: null,
    min: 5,
    max: 300,
    integer: true,
    units: i18n('seconds'),
    placeholder: rpcservertimeout.toString(),
  }),
  rpcthreads: Value.number({
    name: i18n('Threads'),
    description: i18n(
      'Set the number of threads for handling RPC calls. You may wish to increase this if you are making lots of calls via an integration.',
    ),

    required: false,
    default: null,
    min: 4,
    max: 64,
    step: null,
    integer: true,
    units: null,
    placeholder: rpcthreads.toString(),
  }),
  rpcworkqueue: Value.number({
    name: i18n('Work Queue'),
    description: i18n(
      'Set the depth of the work queue to service RPC calls. Determines how long the backlog of RPC requests can get before it just rejects new ones.',
    ),

    required: false,
    default: null,
    min: 8,
    max: 256,
    step: null,
    integer: true,
    units: i18n('requests'),
    placeholder: rpcworkqueue.toString(),
  }),
})

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
  rpcSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    return (await bitcoinConfFile.read().once()) || {}
  },

  // the execution function
  ({ effects, input }) =>
    bitcoinConfFile.merge(effects, nullToUndefined(input)),
)
