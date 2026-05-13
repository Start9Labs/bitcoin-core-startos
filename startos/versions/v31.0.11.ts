import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const v_31_0_11 = VersionInfo.of({
  version: '31.0:11',
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
      // v31 changed CURRENT_FEES_FILE_VERSION (149900 → 309900) and the
      // fee estimator bucket size; ≤30 hard-fails on a v31-written file.
      await rm('/media/startos/volumes/main/fee_estimates.dat', {
        force: true,
      }).catch(console.error)
    },
  },
})
