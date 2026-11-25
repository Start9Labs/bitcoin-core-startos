import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '32.1:4',
  releaseNotes: {
    en_US:
      "On disks under roughly 900 GB, the Pruning setting can't be left empty. An existing archival configuration is not changed.",
    es_ES:
      'En discos de menos de unos 900 GB, el ajuste Poda no puede quedar vacío. Una configuración de archivo existente no se modifica.',
    de_DE:
      'Auf Datenträgern unter etwa 900 GB darf die Einstellung Beschneidung nicht leer bleiben. Eine bestehende Archivkonfiguration wird nicht geändert.',
    pl_PL:
      'Na dyskach mniejszych niż około 900 GB ustawienie Przycinanie nie może pozostać puste. Istniejąca konfiguracja archiwalna nie jest zmieniana.',
    fr_FR:
      'Sur les disques de moins de 900 Go environ, le réglage Élagage ne peut pas rester vide. Une configuration archivale existante n’est pas modifiée.',
  },
  migrations: {
    up: IMPOSSIBLE,
    down: async () => {},
    // Any line's install that has run its own copies of every migration updates here directly.
    other: {
      '=32.1:3': { up: async () => {} },
      '=32.1:2': { up: async () => {} },
      '=32.1:1': { up: async () => {} },
      '=32.1:0': { up: async () => {} },
      '^31.1:27': { up: async () => {} },
      '^30.3:25': { up: async () => {} },
      '^29.4:25': { up: async () => {} },
      '^28.4:38': { up: async () => {} },
    },
  },
})
  .satisfies('31.2:5')
  .satisfies('30.4:4')
  .satisfies('29.5:4')
  .satisfies('28.4:42')
