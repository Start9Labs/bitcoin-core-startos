import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { bitcoinConfFile } from '../../fileModels/bitcoin.conf'
import { bitcoinConfDefaults } from '../../utils'
const { whitebind, bind } = bitcoinConfDefaults

export const v29_1_0_2_beta1 = VersionInfo.of({
  version: '29.1:2-beta.1',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      await bitcoinConfFile.merge(effects, {
        rpcuser: undefined,
        rpcpassword: undefined,
        bind,
        whitebind,
        whitelist: undefined,
      })
    },
    down: IMPOSSIBLE,
  },
})
