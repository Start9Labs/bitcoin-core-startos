import { T } from '@start9labs/start-sdk'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { i2pdConfFile } from '../../fileModels/i2pd.conf'
import { storeJson } from '../../fileModels/store.json'
import {
  rpcallowipPruned,
  rpcbindPruned,
  rpcbind,
  rpcallowip,
} from '../../utils'

export async function ensureFiles(effects: T.Effects) {
  await storeJson.merge(effects, {})
  await i2pdConfFile.merge(effects, {})
  await bitcoinConfFile.merge(effects, {
    ...((await bitcoinConfFile.read((c) => c.prune).once())
      ? {
          rpcbind: rpcbindPruned,
          rpcallowip: rpcallowipPruned,
        }
      : {
          rpcbind,
          rpcallowip,
        }),
  })
}
