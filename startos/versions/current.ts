import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:15',
  releaseNotes: {
    en_US: `- Bitcoin Knots (RDTS) follows a different chain and can no longer be switched to from here.`,
    es_ES: `- Bitcoin Knots (RDTS) sigue una cadena diferente y ya no se puede cambiar a él desde aquí.`,
    de_DE: `- Bitcoin Knots (RDTS) folgt einer anderen Kette und kann von hier aus nicht mehr gewechselt werden.`,
    pl_PL: `- Bitcoin Knots (RDTS) podąża za innym łańcuchem i nie można już się na niego przełączyć.`,
    fr_FR: `- Bitcoin Knots (RDTS) suit une chaîne différente et il n'est plus possible de basculer vers lui depuis ici.`,
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
  .satisfies('30.3:15')
  .satisfies('29.4:15')
  .satisfies('28.4:28')
