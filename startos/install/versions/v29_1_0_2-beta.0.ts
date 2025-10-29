import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { bitcoinConfDefaults } from '../../utils'
import { storeJson } from '../../fileModels/store.json'
import { nocow } from '../versionGraph'
const { whitebind, bind } = bitcoinConfDefaults

export const v29_1_0_2 = VersionInfo.of({
  version: '29.1:2-beta.0',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      await nocow('/media/startos/volumes/main/')
      const store = await storeJson.read().once()

      if (!store) {
        await storeJson.write(effects, {
          reindexBlockchain: false,
          reindexChainstate: false,
          fullySynced: false,
          snapshotInUse: false,
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
        })
        return
      } // Only write conf defaults if no existing bitcoin.conf found

      await bitcoinConfFile.write(effects, bitcoinConfDefaults)
    },
    down: IMPOSSIBLE,
  },
})
