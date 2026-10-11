import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:21',
  releaseNotes: {
    en_US:
      'Adds Delete Block Filter Index to recover from corrupted BIP158 filters without a full blockchain reindex on archival nodes. Index deletion actions now succeed when the index is already absent.',
    es_ES:
      'Añade Eliminar índice de filtros de bloques para reparar filtros BIP158 corruptos sin reindexar toda la cadena en nodos de archivo. Las acciones de eliminación de índices ahora funcionan aunque el índice ya no exista.',
    de_DE:
      'Fügt Blockfilter-Index löschen hinzu, um beschädigte BIP158-Filter auf Archivknoten ohne vollständige Blockchain-Neuindizierung zu reparieren. Das Löschen von Indizes gelingt auch, wenn der Index bereits fehlt.',
    pl_PL:
      'Dodaje Usuń indeks filtrów bloków, aby naprawić uszkodzone filtry BIP158 bez ponownego indeksowania całego blockchaina na węzłach archiwalnych. Usuwanie indeksu działa również wtedy, gdy indeks już nie istnieje.',
    fr_FR:
      "Ajoute Supprimer l'index des filtres de blocs pour réparer les filtres BIP158 corrompus sans réindexer toute la blockchain sur les nœuds d'archive. La suppression des index réussit désormais même si l'index est déjà absent.",
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
