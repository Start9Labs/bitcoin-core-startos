import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '30.4:5',
  releaseNotes: {
    en_US:
      'Requires StartOS 0.4.2 or later. On a pruned node, a block fetched from a peer is now refused if any of its transactions repeats.',
    es_ES:
      'Requiere StartOS 0.4.2 o posterior. En un nodo podado, un bloque obtenido de un par ahora se rechaza si alguna de sus transacciones se repite.',
    de_DE:
      'Erfordert StartOS 0.4.2 oder neuer. Auf einem gekürzten Knoten wird ein von einem Peer abgerufener Block jetzt abgelehnt, wenn sich eine seiner Transaktionen wiederholt.',
    pl_PL:
      'Wymaga StartOS 0.4.2 lub nowszego. Na przyciętym węźle blok pobrany od peera jest teraz odrzucany, jeśli którakolwiek z jego transakcji się powtarza.',
    fr_FR:
      "Nécessite StartOS 0.4.2 ou une version ultérieure. Sur un nœud élagué, un bloc récupéré auprès d'un pair est désormais refusé si l'une de ses transactions se répète.",
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
  .satisfies('29.5:4')
  .satisfies('28.4:42')
