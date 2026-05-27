import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.0:14',
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
    down: async ({ effects }) => {
      // v31 changed CURRENT_FEES_FILE_VERSION (149900 → 309900) and the
      // fee estimator bucket size; ≤30 hard-fails on a v31-written file.
      await rm('/media/startos/volumes/main/fee_estimates.dat', {
        force: true,
      }).catch(console.error)
    },
  },
})
