import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { bitcoinConfDefaults, rpcallowipPruned, rpcbindPruned } from '../utils'
import * as diskusage from 'diskusage'
import { utils } from '@start9labs/start-sdk'
import { i2pdConfFile } from '../fileModels/i2pd.conf'

const diskUsage = utils.once(() => diskusage.check('/'))

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {})

  await bitcoinConfFile.merge(effects, {
    zmqEnabled: true,
    blockfilters: { blockfilterindex: true },
    raw: {
      ...bitcoinConfDefaults,
      ...((await diskUsage()).total < 900_000_000_000
        ? {
            prune: 550,
            rpcbind: rpcbindPruned,
            rpcallowip: rpcallowipPruned,
          }
        : {}),
    },
  })

  await i2pdConfFile.merge(effects, {})
})
