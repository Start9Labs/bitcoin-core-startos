import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { ensureFiles } from './ensureFiles'

export const v_29_3_5_b1 = VersionInfo.of({
  version: '29.3:5-beta.1',
  releaseNotes: {
    en_US: 'Update to StartOS SDK beta.60',
    es_ES: 'Actualización a StartOS SDK beta.60',
    de_DE: 'Update auf StartOS SDK beta.60',
    pl_PL: 'Aktualizacja do StartOS SDK beta.60',
    fr_FR: 'Mise à jour vers StartOS SDK beta.60',
  },
  migrations: {
    up: async ({ effects }) => {
      // harmlessly create or enforce requirements for existing conf files
      await ensureFiles(effects)
    },
    down: IMPOSSIBLE,
  },
})
