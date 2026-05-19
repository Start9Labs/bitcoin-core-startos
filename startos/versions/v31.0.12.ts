import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const v_31_0_12 = VersionInfo.of({
  version: '31.0:12',
  releaseNotes: {
    en_US: `**Bumps**

- start-sdk → 1.5.2

**Fixes**

- "Enable IPC" action now auto-restarts Bitcoin Core to apply the change.`,
    es_ES: `**Actualizaciones**

- start-sdk → 1.5.2

**Correcciones**

- La acción "Habilitar IPC" ahora reinicia automáticamente Bitcoin Core para aplicar el cambio.`,
    de_DE: `**Aktualisierungen**

- start-sdk → 1.5.2

**Korrekturen**

- Die Aktion „IPC aktivieren" startet Bitcoin Core jetzt automatisch neu, um die Änderung anzuwenden.`,
    pl_PL: `**Aktualizacje**

- start-sdk → 1.5.2

**Poprawki**

- Akcja „Włącz IPC" automatycznie ponownie uruchamia Bitcoin Core, aby zastosować zmianę.`,
    fr_FR: `**Mises à jour**

- start-sdk → 1.5.2

**Corrections**

- L'action « Activer IPC » redémarre désormais automatiquement Bitcoin Core pour appliquer le changement.`,
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
