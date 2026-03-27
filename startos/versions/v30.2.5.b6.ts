import { VersionInfo } from '@start9labs/start-sdk'

export const v_30_2_5_b6 = VersionInfo.of({
  version: '30.2:5-beta.6',
  releaseNotes: {
    en_US: 'Multiple bug fixes',
    es_ES: 'Múltiples correcciones de errores',
    de_DE: 'Mehrere Fehlerbehebungen',
    pl_PL: 'Wiele poprawek błędów',
    fr_FR: 'Corrections de bugs multiples',
  },
  migrations: {
    down: async ({ effects }) => {},
  },
})
