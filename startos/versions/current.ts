import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.4:24',
  releaseNotes: {
    en_US:
      'Stops trusting certificates from a compromised certificate authority (eMudhra).',
    es_ES:
      'Deja de confiar en los certificados de una autoridad de certificación comprometida (eMudhra).',
    de_DE:
      'Vertraut Zertifikaten einer kompromittierten Zertifizierungsstelle (eMudhra) nicht mehr.',
    pl_PL:
      'Przestaje ufać certyfikatom przejętego urzędu certyfikacji (eMudhra).',
    fr_FR: `Ne fait plus confiance aux certificats d'une autorité de certification compromise (eMudhra).`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
}).satisfies('28.4:29')
