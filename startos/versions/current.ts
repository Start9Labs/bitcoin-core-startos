import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '30.4:2',
  releaseNotes: {
    en_US:
      'Requires StartOS 0.4.1 or later. Fixes memory use growing while the service runs.',
    es_ES:
      'Requiere StartOS 0.4.1 o posterior. Corrige el aumento del uso de memoria mientras el servicio está en ejecución.',
    de_DE:
      'Erfordert StartOS 0.4.1 oder neuer. Behebt einen während der Laufzeit des Dienstes ansteigenden Speicherverbrauch.',
    pl_PL:
      'Wymaga StartOS 0.4.1 lub nowszego. Naprawia wzrost zużycia pamięci podczas działania usługi.',
    fr_FR:
      "Nécessite StartOS 0.4.1 ou une version ultérieure. Corrige l'augmentation de la consommation de mémoire pendant le fonctionnement du service.",
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
  .satisfies('29.4:16')
  .satisfies('28.4:29')
