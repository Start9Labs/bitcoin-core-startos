import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { ensureFiles } from './ensureFiles'

export const v_28_3_5_b0 = VersionInfo.of({
  version: '28.3:5-beta.0',
  releaseNotes: {
    en_US: 'Update to StartOS SDK beta.59',
    es_ES: 'Actualización a StartOS SDK beta.59',
    de_DE: 'Update auf StartOS SDK beta.59',
    pl_PL: 'Aktualizacja do StartOS SDK beta.59',
    fr_FR: 'Mise à jour vers StartOS SDK beta.59',
  },
  migrations: {
    up: async ({ effects }) => {
      await ensureFiles(effects)
    },
    down: IMPOSSIBLE,
  },
})
