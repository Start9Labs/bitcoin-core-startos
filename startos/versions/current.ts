import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:18',
  releaseNotes: {
    en_US:
      'Frigate and other services that speak JSON-RPC 2.0 can now connect to Bitcoin.',
    es_ES:
      'Frigate y otros servicios que usan JSON-RPC 2.0 ahora pueden conectarse a Bitcoin.',
    de_DE:
      'Frigate und andere Dienste, die JSON-RPC 2.0 verwenden, können sich jetzt mit Bitcoin verbinden.',
    pl_PL:
      'Frigate i inne usługi korzystające z JSON-RPC 2.0 mogą teraz łączyć się z Bitcoinem.',
    fr_FR:
      'Frigate et les autres services utilisant JSON-RPC 2.0 peuvent désormais se connecter à Bitcoin.',
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
  .satisfies('30.3:16')
  .satisfies('29.4:16')
  .satisfies('28.4:29')
