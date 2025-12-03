import { T } from '@start9labs/start-sdk'
import { sdk } from '../../sdk'
import { bitcoinConfDefaults } from '../../utils'
import { storeJson } from '../../fileModels/store.json'

const { Value } = sdk
const { enableIpc } = bitcoinConfDefaults

const ipcSpec = sdk.InputSpec.of({
  enableIpc: Value.toggle({
    name: 'Enable IPC',
    description:
      'Enable inter-process communication (IPC) via Unix socket. This allows other services to communicate with Bitcoin Core using a high-performance local socket connection. The socket path will be displayed in Runtime Information.',
    warning:
      'IPC is an experimental feature. Only enable this if you know what you are doing with the IPC socket. An example use case would be Stratum v2 mining services.',
    default: false,
  }),
})

export const ipcConfig = sdk.Action.withInput(
  // id
  'ipc-config',

  // metadata
  async ({ effects }) => ({
    name: 'IPC Settings',
    description: 'Configure inter-process communication (IPC) settings',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),

  // form input specification
  ipcSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(effects, input),
)

async function read(effects: any): Promise<PartialIpcSpec> {
  const store = await storeJson.read().const(effects)

  return {
    enableIpc: store?.enableIpc !== undefined ? store.enableIpc : enableIpc,
  }
}

async function write(effects: T.Effects, input: IpcSpec) {
  const { enableIpc: inputEnableIpc } = input

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

type IpcSpec = typeof ipcSpec._TYPE
type PartialIpcSpec = typeof ipcSpec._PARTIAL
