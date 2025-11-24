import { VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../../fileModels/store.json'
import { bitcoinConfDefaults } from '../../utils'

export const v30_0_0_1_beta3 = VersionInfo.of({
  version: '30.0.0:1-beta.3',
  releaseNotes: 'Revamped for StartOS 0.4.0. Added IPC socket binding support for inter-process communication.',
  migrations: {
    up: async ({ effects }) => {
      // Add enableIpc to store.json (not bitcoin.conf)
      await storeJson.merge(effects, {
        enableIpc: bitcoinConfDefaults.enableIpc,
      })
    },
    down: async ({ effects }) => {},
  },
})
