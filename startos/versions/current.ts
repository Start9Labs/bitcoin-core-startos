import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.2:12',
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
      // v30 introduced indexes/coinstatsindex/ at a new path; ≤29 doesn't read it.
      // Core preserved indexes/coinstats/ on upgrade for exactly this rollback.
      await rm('/media/startos/volumes/main/indexes/coinstatsindex', {
        recursive: true,
        force: true,
      }).catch(console.error)
    },
  },
})
