import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const v_30_2_11 = VersionInfo.of({
  version: '30.2:11',
  releaseNotes: {
    en_US: `**Internal**

- Updated to start-sdk 1.5.1.`,
    es_ES: `**Interno**

- Actualizado a start-sdk 1.5.1.`,
    de_DE: `**Intern**

- Aktualisierung auf start-sdk 1.5.1.`,
    pl_PL: `**Wewnętrzne**

- Zaktualizowano do start-sdk 1.5.1.`,
    fr_FR: `**Interne**

- Mise à jour vers start-sdk 1.5.1.`,
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
