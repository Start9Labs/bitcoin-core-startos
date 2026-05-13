import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_28_4_11 = VersionInfo.of({
  version: '28.4:11',
  releaseNotes: {
    en_US: `**Bumps**

- Bitcoin Core 28.3 → 28.4 (bug fixes; see upstream release notes)
- start-sdk → 1.5.0

**Features**

- Added in-app usage instructions.`,
    es_ES: `**Actualizaciones**

- Bitcoin Core 28.3 → 28.4 (correcciones de errores; ver notas de la versión upstream)
- start-sdk → 1.5.0

**Funcionalidades**

- Se añadieron instrucciones de uso en la aplicación.`,
    de_DE: `**Aktualisierungen**

- Bitcoin Core 28.3 → 28.4 (Fehlerbehebungen; siehe Upstream-Release-Notes)
- start-sdk → 1.5.0

**Funktionen**

- In-App-Bedienungsanleitung hinzugefügt.`,
    pl_PL: `**Aktualizacje**

- Bitcoin Core 28.3 → 28.4 (poprawki błędów; zobacz informacje o wydaniu upstream)
- start-sdk → 1.5.0

**Funkcje**

- Dodano instrukcję obsługi w aplikacji.`,
    fr_FR: `**Mises à jour**

- Bitcoin Core 28.3 → 28.4 (corrections de bugs ; voir les notes de version upstream)
- start-sdk → 1.5.0

**Nouveautés**

- Ajout d'instructions d'utilisation intégrées.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
