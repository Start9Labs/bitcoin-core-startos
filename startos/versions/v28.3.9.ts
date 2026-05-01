import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v_28_3_9 = VersionInfo.of({
  version: '28.3:9',
  releaseNotes: {
    en_US: 'Internal updates (start-sdk 1.3.3); remove leftover chainstate.old at startup and exclude it from backups',
    es_ES: 'Actualizaciones internas (start-sdk 1.3.3); eliminar chainstate.old residual al iniciar y excluirlo de las copias de seguridad',
    de_DE: 'Interne Aktualisierungen (start-sdk 1.3.3); übrig gebliebenes chainstate.old beim Start entfernen und von Backups ausschließen',
    pl_PL: 'Aktualizacje wewnętrzne (start-sdk 1.3.3); usunięcie pozostałego chainstate.old przy uruchomieniu i wykluczenie go z kopii zapasowych',
    fr_FR: 'Mises à jour internes (start-sdk 1.3.3) ; suppression du chainstate.old résiduel au démarrage et exclusion des sauvegardes',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
