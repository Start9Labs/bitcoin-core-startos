import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const v_30_2_12 = VersionInfo.of({
  version: '30.2:12',
  releaseNotes: {
    en_US: 'Updated to start-sdk 1.5.2.',
    es_ES: 'Actualizado a start-sdk 1.5.2.',
    de_DE: 'Aktualisierung auf start-sdk 1.5.2.',
    pl_PL: 'Zaktualizowano do start-sdk 1.5.2.',
    fr_FR: 'Mise à jour vers start-sdk 1.5.2.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {
      // v30 introduced indexes/coinstatsindex/ at a new path; ≤29 doesn't read it.
      // Core preserved indexes/coinstats/ on upgrade for exactly this rollback.
      await rm('/media/startos/volumes/main/indexes/coinstatsindex', {
        recursive: true,
        force: true,
      }).catch(console.error)
    },
  },
})
