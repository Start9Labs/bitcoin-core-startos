import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.5:5',
  releaseNotes: {
    en_US:
      'On a pruned node, a block fetched from a peer is now refused if any of its transactions repeats.',
    es_ES:
      'En un nodo podado, un bloque obtenido de un par ahora se rechaza si alguna de sus transacciones se repite.',
    de_DE:
      'Auf einem gekürzten Knoten wird ein von einem Peer abgerufener Block jetzt abgelehnt, wenn sich eine seiner Transaktionen wiederholt.',
    pl_PL:
      'Na przyciętym węźle blok pobrany od peera jest teraz odrzucany, jeśli którakolwiek z jego transakcji się powtarza.',
    fr_FR:
      "Sur un nœud élagué, un bloc récupéré auprès d'un pair est désormais refusé si l'une de ses transactions se répète.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
}).satisfies('28.4:42')
