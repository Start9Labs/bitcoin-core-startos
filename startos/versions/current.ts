import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.4:22',
  releaseNotes: {
    en_US:
      'Blockchain Sync shows when the node has fallen behind the network, and by how many blocks.',
    es_ES:
      'La comprobación de estado Progreso de sincronización de blockchain muestra cuándo el nodo se ha quedado por detrás de la red y por cuántos bloques.',
    de_DE:
      'Die Zustandsprüfung Blockchain-Synchronisationsfortschritt zeigt, wann der Knoten hinter das Netzwerk zurückgefallen ist und um wie viele Blöcke.',
    pl_PL:
      'Kontrola stanu Postęp synchronizacji blockchain pokazuje, kiedy węzeł został w tyle za siecią i o ile bloków.',
    fr_FR:
      "La vérification d'état Progression de la synchronisation blockchain indique quand le nœud a pris du retard sur le réseau, et de combien de blocs.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
}).satisfies('28.4:29')
