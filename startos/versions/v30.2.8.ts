import { VersionInfo } from '@start9labs/start-sdk'

export const v_30_2_8 = VersionInfo.of({
  version: '30.2:8',
  releaseNotes: {
    en_US:
      'Always persist the `prune` setting in bitcoin.conf. Existing archival nodes (where prune was absent) now explicitly record `prune=0`.',
    es_ES:
      'El ajuste `prune` se persiste siempre en bitcoin.conf. Los nodos archivales existentes (donde prune estaba ausente) registran ahora explícitamente `prune=0`.',
    de_DE:
      'Die Einstellung `prune` wird jetzt immer in der bitcoin.conf gespeichert. Bestehende Archiv-Knoten (bei denen prune fehlte) tragen jetzt explizit `prune=0` ein.',
    pl_PL:
      'Ustawienie `prune` jest teraz zawsze zapisywane w bitcoin.conf. Istniejące węzły archiwalne (w których prune był nieobecny) teraz jawnie zapisują `prune=0`.',
    fr_FR:
      "L'option `prune` est désormais toujours inscrite dans bitcoin.conf. Les nœuds d'archive existants (où prune était absent) enregistrent maintenant explicitement `prune=0`.",
  },
  migrations: {
    down: async ({ effects }) => {},
  },
})
