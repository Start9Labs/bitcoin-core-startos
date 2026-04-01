import { VersionInfo } from '@start9labs/start-sdk'

export const v_29_3_5 = VersionInfo.of({
  version: '29.3:5',
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
