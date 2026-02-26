import { sdk } from '../../sdk'
import { bitcoinConfFile, fullConfigSpec } from '../../fileModels/bitcoin.conf'
import { storeJson } from '../../fileModels/store.json'
import { i18n } from '../../i18n'

const { Value } = sdk

export const otherConfig = sdk.Action.withInput(
  // id
  'other-config',

  // metadata
  async ({ effects }) => ({
    name: i18n('Other Settings'),
    description: i18n('Edit more values in bitcoin.conf'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // form input specification
  fullConfigSpec
    .filter({
      blockfilters: true,
      blocknotify: true,
      coinstatsindex: true,
      dbbatchsize: true,
      dbcache: true,
      peerbloomfilters: true,
      prune: true,
      txindex: true,
      wallet: true,
      zmqEnabled: true,
    })
    .add({
      enableIpc: Value.dynamicToggle(async ({ effects }) => {
        const ipcEnabled = await storeJson.read((s) => s.enableIpc).once()
        return {
          name: i18n('Enable IPC'),
          description: i18n(
            'Enable inter-process communication (IPC) via Unix socket. This allows other services to communicate with Bitcoin Core using a high-performance local socket connection. The socket path will be displayed in Runtime Information.',
          ),
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
  async ({ effects }) => {
    const bitcoinConf = await bitcoinConfFile.read().once()
    const enableIpc = await storeJson.read((s) => s.enableIpc).once()

    return {
      ...bitcoinConf,
      enableIpc: enableIpc ?? false,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const oldPrune = await bitcoinConfFile.read((c) => c.prune).once()

    await bitcoinConfFile.merge(effects, input)

    const storeUpdate: Record<string, unknown> = {
      enableIpc: input.enableIpc,
    }

    // Switching from pruned to archival requires a full reindex
    if (oldPrune && !input.prune) {
      storeUpdate.reindexBlockchain = true
    }

    await storeJson.merge(effects, storeUpdate)
  },
)
