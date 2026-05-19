import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { Value } = sdk

const ipcDescription = () =>
  `${i18n(
    'Enable inter-process communication (IPC) via Unix socket. This allows other services to communicate with Bitcoin Core using a high-performance local socket connection. The socket path will be displayed in Runtime Information.',
  )} ${i18n('Changing this value will automatically restart the service.')}`

export const ipc = sdk.Action.withInput(
  // id
  'ipc',

  // metadata
  async ({ effects }) => ({
    name: i18n('Enable IPC'),
    description: ipcDescription(),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  sdk.InputSpec.of({
    enableIpc: Value.dynamicToggle(async ({ effects }) => {
      const ipcEnabled = await storeJson.read((s) => s.enableIpc).once()
      return {
        name: i18n('Enable IPC'),
        description: ipcDescription(),
        warning: ipcEnabled
          ? null
          : i18n(
              'IPC is an experimental feature. Only enable this if you know what you are doing with the IPC socket. An example use case would be Stratum v2 mining services.',
            ),
        default: false,
      }
    }),
  }),

  // optionally pre-fill the input form
  async ({ effects }) => ({
    enableIpc: (await storeJson.read((s) => s.enableIpc).once()) ?? false,
  }),

  // the execution function
  async ({ effects, input }) => {
    const prev = (await storeJson.read((s) => s.enableIpc).once()) ?? false
    await storeJson.merge(effects, { enableIpc: input.enableIpc })

    if (prev === input.enableIpc) return

    const status = await sdk
      .getStatus(effects, { packageId: 'bitcoind' })
      .once()
    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
    }
  },
)
