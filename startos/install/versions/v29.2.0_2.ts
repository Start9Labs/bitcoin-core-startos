import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { ensureFiles } from './ensureFiles'

export const v29_2_0_2 = VersionInfo.of({
  version: '29.2:2-beta.5',
  releaseNotes: {
    en_US: 'Revamped for StartOS 0.4.0',
    es_ES: 'Renovado para StartOS 0.4.0',
    de_DE: 'Überarbeitet für StartOS 0.4.0',
    pl_PL: 'Przeprojektowany dla StartOS 0.4.0',
    fr_FR: 'Refait pour StartOS 0.4.0',
  },
  migrations: {
    up: async ({ effects }) => {
      // harmlessly create or enforce requirements for existing conf files
      await ensureFiles(effects)
    },
    down: IMPOSSIBLE,
  },
})
