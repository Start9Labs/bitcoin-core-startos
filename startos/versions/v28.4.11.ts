import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_28_4_11 = VersionInfo.of({
  version: '28.4:11',
  releaseNotes: {
    en_US: `**Bumps**

- Bitcoin Core 28.3 → 28.4. Maintenance release: fixes legacy wallet migration edge cases, removes a defunct DNS seed, plus assorted bug fixes and translation updates.

**Internal**

- Updated to start-sdk 1.5.1.`,
    es_ES: `**Actualizaciones**

- Bitcoin Core 28.3 → 28.4. Versión de mantenimiento: corrige casos límite en la migración de monederos heredados, elimina una semilla DNS obsoleta y agrega correcciones de errores y traducciones.

**Interno**

- Actualizado a start-sdk 1.5.1.`,
    de_DE: `**Updates**

- Bitcoin Core 28.3 → 28.4. Wartungs-Release: Behebt Randfälle bei der Migration alter Wallets, entfernt einen ausgemusterten DNS-Seed sowie diverse Bugfixes und Übersetzungsaktualisierungen.

**Intern**

- Aktualisierung auf start-sdk 1.5.1.`,
    pl_PL: `**Aktualizacje**

- Bitcoin Core 28.3 → 28.4. Wydanie konserwacyjne: naprawia skrajne przypadki migracji starszych portfeli, usuwa wycofany seed DNS oraz różne poprawki błędów i aktualizacje tłumaczeń.

**Wewnętrzne**

- Zaktualizowano do start-sdk 1.5.1.`,
    fr_FR: `**Mises à jour**

- Bitcoin Core 28.3 → 28.4. Version de maintenance : corrige des cas limites de migration des anciens portefeuilles, supprime un seed DNS obsolète, et apporte diverses corrections de bugs et mises à jour de traductions.

**Interne**

- Mise à jour vers start-sdk 1.5.1.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
