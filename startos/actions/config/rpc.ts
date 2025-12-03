import { T } from '@start9labs/start-sdk'
import { bitcoinConfFile, shape } from '../../fileModels/bitcoin.conf'
import { sdk } from '../../sdk'
import { bitcoinConfDefaults } from '../../utils'
import { storeJson } from '../../fileModels/store.json'

const { Value } = sdk
const { rpcservertimeout, rpcthreads, rpcworkqueue, enableIpc } = bitcoinConfDefaults

const rpcSpec = sdk.InputSpec.of({
  servertimeout: Value.number({
    name: 'Rpc Server Timeout',
    description:
      'Number of seconds after which an uncompleted RPC call will time out.',
    required: false,
    default: rpcservertimeout,
    min: 5,
    max: 300,
    integer: true,
    units: 'seconds',
    placeholder: rpcservertimeout.toString(),
  }),
  threads: Value.number({
    name: 'Threads',
    description:
      'Set the number of threads for handling RPC calls. You may wish to increase this if you are making lots of calls via an integration.',

    required: false,
    default: rpcthreads,
    min: 4,
    max: 64,
    step: null,
    integer: true,
    units: null,
    placeholder: rpcthreads.toString(),
  }),
  workqueue: Value.number({
    name: 'Work Queue',
    description:
      'Set the depth of the work queue to service RPC calls. Determines how long the backlog of RPC requests can get before it just rejects new ones.',

    required: false,
    default: rpcworkqueue,
    min: 8,
    max: 256,
    step: null,
    integer: true,
    units: 'requests',
    placeholder: rpcworkqueue.toString(),
  }),
  enableIpc: Value.toggle({
    name: 'Enable IPC',
    description:
      'Enable inter-process communication (IPC) via Unix socket. This allows other services to communicate with Bitcoin Core using a high-performance local socket connection. The socket path will be displayed in Runtime Information.',
    warning:
      'IPC is an experimental feature. Only enable this if you know what you are doing with the IPC socket. An example use case would be Stratum v2 mining services.',
    default: false,
  }),
})

export const rpcConfig = sdk.Action.withInput(
  // id
  'rpc-config',

  // metadata
  async ({ effects }) => ({
    name: 'RPC Settings',
    description: 'Edit the RPC settings in bitcoin.conf',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),

  // form input specification
  rpcSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(effects, input),
)

async function read(effects: any): Promise<PartialRpcSpec> {
  const bitcoinConf = await bitcoinConfFile.read().const(effects)
  if (!bitcoinConf) return {}

  const store = await storeJson.read().const(effects)

  return {
    servertimeout: bitcoinConf.rpcservertimeout,
    threads: bitcoinConf.rpcthreads,
    workqueue: bitcoinConf.rpcworkqueue,
    enableIpc: store?.enableIpc !== undefined ? store.enableIpc : enableIpc,
  }
}

async function write(effects: T.Effects, input: RpcSpec) {
  const { servertimeout, threads, workqueue, enableIpc: inputEnableIpc } = input

  const rpcSettings = {
    rpcservertimeout: servertimeout || rpcservertimeout,
    rpcthreads: threads || rpcthreads,
    rpcworkqueue: workqueue || rpcworkqueue,
  }

  await bitcoinConfFile.merge(effects, rpcSettings)

  // Check if IPC setting changed (requires restart since it changes the binary)
  const currentStore = await storeJson.read().const(effects)
  const currentEnableIpc = currentStore?.enableIpc !== undefined ? currentStore.enableIpc : enableIpc
  const newEnableIpc = inputEnableIpc !== undefined ? inputEnableIpc : enableIpc

  // Store enableIpc separately in store.json
  await storeJson.merge(effects, {
    enableIpc: newEnableIpc,
  })

  // Restart if IPC setting changed (switches between bitcoind and bitcoin-node)
  if (currentEnableIpc !== newEnableIpc) {
    await sdk.restart(effects)
  }
}

type RpcSpec = typeof rpcSpec._TYPE
type PartialRpcSpec = typeof rpcSpec._PARTIAL
