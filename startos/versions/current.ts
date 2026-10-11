import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:32',
  releaseNotes: {
    en_US:
      'Adds Delete Block Filter Index to recover from corrupted BIP158 filters without a full blockchain reindex on archival nodes. Index deletions now tolerate absent directories, and Delete Coinstats Index targets the correct directory.',
    es_ES:
      'Añade Eliminar índice de filtros de bloques para reparar filtros BIP158 corruptos sin reindexar toda la cadena en nodos de archivo. La eliminación de índices tolera directorios ausentes y Eliminar índice Coinstats usa el directorio correcto.',
    de_DE:
      'Fügt Blockfilter-Index löschen hinzu, um beschädigte BIP158-Filter auf Archivknoten ohne vollständige Blockchain-Neuindizierung zu reparieren. Fehlende Indexverzeichnisse verursachen keinen Löschfehler mehr, und Coinstats-Index löschen verwendet das richtige Verzeichnis.',
    pl_PL:
      'Dodaje Usuń indeks filtrów bloków, aby naprawić uszkodzone filtry BIP158 bez ponownego indeksowania całego blockchaina na węzłach archiwalnych. Usuwanie indeksów toleruje brak katalogów, a Usuń indeks Coinstats używa poprawnego katalogu.',
    fr_FR:
      "Ajoute Supprimer l'index des filtres de blocs pour réparer les filtres BIP158 corrompus sans réindexer toute la blockchain sur les nœuds d'archive. La suppression des index tolère les répertoires absents et Supprimer l'index Coinstats utilise le bon répertoire.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
