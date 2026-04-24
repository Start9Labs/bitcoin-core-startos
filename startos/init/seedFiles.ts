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

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  // install, update, restore
  await storeJson.merge(effects, {})
  await i2pdConfFile.merge(effects, {})

  if (kind === 'install') {
    await bitcoinConfFile.merge(effects, {
      zmqEnabled: true,
      blockfilters: { blockfilterindex: true },
      dbcache: defaultDbcache(),
      dbbatchsize: defaultDbbatchsize(),
      prune: (await diskUsage()).total < archivalMin ? minPrune : 0,
      raw: {
        i2psam: i2PSamAddress,
        assumevalid:
          '00000000000000000000611fd22f2df7c8fbd0688745c3a6c3bb5109cc2a12cb',
      },
    })
  } else {
    await bitcoinConfFile.merge(effects, {})
  }
})
