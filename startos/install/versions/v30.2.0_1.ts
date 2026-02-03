import { VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../../fileModels/store.json'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { bitcoinConfDefaults, isEmbeddedI2P } from '../../utils'
const { whitebind, bind } = bitcoinConfDefaults

export const v30_2_0_1 = VersionInfo.of({
  version: '30.2.0:1-beta.0',
  releaseNotes: {
    en_US: 'Revamped for StartOS 0.4.0',
    es_ES: 'Renovado para StartOS 0.4.0',
    de_DE: 'Überarbeitet für StartOS 0.4.0',
    pl_PL: 'Przeprojektowany dla StartOS 0.4.0',
    fr_FR: 'Refait pour StartOS 0.4.0',
  },
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
    down: async ({ effects }) => {
      // if using embedded I2P, remove i2psam setting because it won't work after downgrade
      const i2psam = await bitcoinConfFile.read((x) => x.i2psam).once()
      if (i2psam && isEmbeddedI2P(i2psam)) {
        await bitcoinConfFile.merge(effects, {
          i2psam: undefined,
        })
      }
    },
  },
})
