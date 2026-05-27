import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:12',
  releaseNotes: {
    en_US:
      'Fixes repeated "Sync Complete" notifications that could fire after the initial sync.',
    es_ES:
      'Corrige notificaciones repetidas de "Sincronización completa" que podían aparecer tras la sincronización inicial.',
    de_DE:
      'Behebt wiederholte „Synchronisierung abgeschlossen"-Benachrichtigungen, die nach der ersten Synchronisierung auftreten konnten.',
    pl_PL:
      'Naprawia powtarzające się powiadomienia „Synchronizacja zakończona", które mogły pojawiać się po początkowej synchronizacji.',
    fr_FR:
      'Corrige les notifications « Synchronisation terminée » répétées qui pouvaient apparaître après la synchronisation initiale.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
