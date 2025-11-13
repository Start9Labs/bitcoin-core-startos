import { VersionGraph } from '@start9labs/start-sdk'
import { coreCurrent, other } from './versions'
import { storeJson } from '../fileModels/store.json'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { bitcoinConfDefaults } from '../utils'
import { sdk } from '../sdk'
import { mainMounts } from '../main'

export const versionGraph = VersionGraph.of({
  current: coreCurrent,
  other,
  preInstall: async (effects) => {
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'bitcoind' },
      mainMounts,
      'nocow',
      async (subc) => {
        await subc.execFail(['chattr', '-R', '+C', '/.bitcoin'])
      },
    )
    const store = await storeJson.read().once()

    if (!store) {
      await storeJson.write(effects, {
        reindexBlockchain: false,
        reindexChainstate: false,
        fullySynced: false,
        snapshotInUse: false,
      })
    }

    const conf = await bitcoinConfFile.read().once()

    if (!conf) {
      await bitcoinConfFile.write(effects, bitcoinConfDefaults)
    }
  },
})
