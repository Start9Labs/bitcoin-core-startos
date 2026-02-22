import { VersionInfo } from '@start9labs/start-sdk'
import { ensureFiles } from './ensureFiles'

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
      await ensureFiles(effects)
    },
    down: async ({ effects }) => {},
  },
})
