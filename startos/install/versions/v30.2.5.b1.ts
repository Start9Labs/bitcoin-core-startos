import { VersionInfo } from '@start9labs/start-sdk'
import { ensureFiles } from './ensureFiles'

export const v_30_2_5_b1 = VersionInfo.of({
  version: '30.2:5-beta.1',
  releaseNotes: {
    en_US: 'Update to StartOS SDK beta.60',
    es_ES: 'Actualización a StartOS SDK beta.60',
    de_DE: 'Update auf StartOS SDK beta.60',
    pl_PL: 'Aktualizacja do StartOS SDK beta.60',
    fr_FR: 'Mise à jour vers StartOS SDK beta.60',
  },
  migrations: {
    up: async ({ effects }) => {
      await ensureFiles(effects)
    },
    down: async ({ effects }) => {},
  },
})
