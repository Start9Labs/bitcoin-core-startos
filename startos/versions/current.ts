import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:22',
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
  .satisfies('29.4:16')
  .satisfies('28.4:29')
