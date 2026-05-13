import { VersionInfo } from '@start9labs/start-sdk'

export const v_29_3_11 = VersionInfo.of({
  version: '29.3:11',
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
    down: async ({ effects }) => {},
  },
})
