import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:17',
  releaseNotes: {
    en_US:
      "Bitcoin's REST interface is now available to dependent services such as Electrs.",
    es_ES:
      'La interfaz REST de Bitcoin está ahora disponible para servicios dependientes como Electrs.',
    de_DE:
      'Die REST-Schnittstelle von Bitcoin steht jetzt abhängigen Diensten wie Electrs zur Verfügung.',
    pl_PL:
      'Interfejs REST Bitcoina jest teraz dostępny dla usług zależnych, takich jak Electrs.',
    fr_FR:
      "L'interface REST de Bitcoin est désormais disponible pour les services dépendants tels qu'Electrs.",
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
