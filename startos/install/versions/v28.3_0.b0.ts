import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { ensureFiles } from './ensureFiles'

export const v28_3_0_b0 = VersionInfo.of({
  version: '28.3:0-beta.0',
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
    down: IMPOSSIBLE,
  },
})
