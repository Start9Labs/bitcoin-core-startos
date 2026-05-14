import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const v_31_0_11 = VersionInfo.of({
  version: '31.0:11',
  releaseNotes: {
    en_US: `- Added in-app usage instructions.
- Updated to start-sdk 1.5.0.`,
    es_ES: `- Se añadieron instrucciones de uso en la aplicación.
- Actualizado a start-sdk 1.5.0.`,
    de_DE: `- In-App-Bedienungsanleitung hinzugefügt.
- Aktualisierung auf start-sdk 1.5.0.`,
    pl_PL: `- Dodano instrukcję obsługi w aplikacji.
- Zaktualizowano do start-sdk 1.5.0.`,
    fr_FR: `- Ajout d'instructions d'utilisation intégrées.
- Mise à jour vers start-sdk 1.5.0.`,
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
