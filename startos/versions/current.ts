import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:36',
  releaseNotes: {
    en_US: 'Built with start-sdk 3.1.0.',
    es_ES: 'Compilado con start-sdk 3.1.0.',
    de_DE: 'Erstellt mit start-sdk 3.1.0.',
    pl_PL: 'Zbudowano z start-sdk 3.1.0.',
    fr_FR: 'Construit avec start-sdk 3.1.0.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
