import { VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../../fileModels/store.json'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { bitcoinConfDefaults } from '../../utils'
const { whitebind, bind } = bitcoinConfDefaults

export const v30_0_0_1 = VersionInfo.of({
  version: '30.0.0:1-beta.8',
  releaseNotes: 'Revamped for StartOS 0.4.0.',
  migrations: {
    up: async ({ effects }) => {
      const store = await storeJson.read().once()
      // Add enableIpc to store.json (not bitcoin.conf)
      if (!store) {
        await storeJson.write(effects, {
          reindexBlockchain: false,
          reindexChainstate: false,
          fullySynced: false,
          snapshotInUse: false,
          enableIpc: false,
        })
      } else {
        await storeJson.merge(effects, {
          enableIpc: false,
        })
      }

      const existingConf = await bitcoinConfFile.read().once()

      if (existingConf) {
        await bitcoinConfFile.merge(effects, {
          rpcuser: undefined,
          rpcpassword: undefined,
          bind,
          whitebind,
          whitelist: undefined,
          mempoolfullrbf: undefined,
        })
        return
      } // Only write conf defaults if no existing bitcoin.conf found

      await bitcoinConfFile.write(effects, bitcoinConfDefaults)
    },
    down: async ({ effects }) => {},
  },
})
