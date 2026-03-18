import { YAML } from '@start9labs/start-sdk'
import { readFile, rm } from 'fs/promises'
import {
  archivalMin,
  bitcoinConfFile,
  defaultDbbatchsize,
  defaultDbcache,
  diskUsage,
  minPrune,
} from '../fileModels/bitcoin.conf'
import { i2pdConfFile } from '../fileModels/i2pd.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { i2PSamAddress } from '../utils'

const configYamlPath = '/media/startos/volumes/main/start9/config.yaml'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  // install, update, restore
  await storeJson.merge(effects, {})
  await i2pdConfFile.merge(effects, {})

  // install
  if (kind === 'install') {
    await bitcoinConfFile.merge(effects, {
      zmqEnabled: true,
      blockfilters: { blockfilterindex: true },
      dbcache: defaultDbcache,
      dbbatchsize: defaultDbbatchsize,
      ...((await diskUsage()).total < archivalMin ? { prune: minPrune } : {}),
      raw: {
        i2psam: i2PSamAddress,
        assumevalid:
          '00000000000000000000611fd22f2df7c8fbd0688745c3a6c3bb5109cc2a12cb',
      },
    })
    // update or restore with config.yaml (0.3.5 -> 0.4.0)
  } else if (
    await readFile(configYamlPath, 'utf-8').then(YAML.parse, () => undefined)
  ) {
    await bitcoinConfFile.merge(effects, {
      raw: {
        i2psam: i2PSamAddress,
      },
    })
    await rm(configYamlPath)
    // update or restore without config.yaml (0.4.0 -> 0.4.0)
  } else {
    await bitcoinConfFile.merge(effects, {})
  }
})
