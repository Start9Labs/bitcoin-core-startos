import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:28',
  releaseNotes: {
    en_US: `- Bitcoin Knots (RDTS) follows a different chain and can no longer be switched to from here.`,
    es_ES: `- Bitcoin Knots (RDTS) sigue una cadena diferente y ya no se puede cambiar a él desde aquí.`,
    de_DE: `- Bitcoin Knots (RDTS) folgt einer anderen Kette und kann von hier aus nicht mehr gewechselt werden.`,
    pl_PL: `- Bitcoin Knots (RDTS) podąża za innym łańcuchem i nie można już się na niego przełączyć.`,
    fr_FR: `- Bitcoin Knots (RDTS) suit une chaîne différente et il n'est plus possible de basculer vers lui depuis ici.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
