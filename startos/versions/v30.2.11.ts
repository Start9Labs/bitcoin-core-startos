import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const v_30_2_11 = VersionInfo.of({
  version: '30.2:11',
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
      // v30 introduced indexes/coinstatsindex/ at a new path; ≤29 doesn't read it.
      // Core preserved indexes/coinstats/ on upgrade for exactly this rollback.
      await rm('/media/startos/volumes/main/indexes/coinstatsindex', {
        recursive: true,
        force: true,
      }).catch(console.error)
    },
  },
})
