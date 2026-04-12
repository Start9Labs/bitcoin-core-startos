import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_28_3_6 = VersionInfo.of({
  version: '28.3:6',
  releaseNotes: {
    en_US: 'Re-enable Berkeley DB support so legacy BDB wallets can be opened',
    es_ES:
      'Se vuelve a habilitar el soporte de Berkeley DB para abrir monederos BDB heredados',
    de_DE:
      'Berkeley-DB-Unterstützung wieder aktiviert, damit ältere BDB-Wallets geöffnet werden können',
    pl_PL:
      'Ponownie włączono obsługę Berkeley DB, aby móc otwierać starsze portfele BDB',
    fr_FR:
      'Réactivation du support Berkeley DB pour permettre l’ouverture des anciens portefeuilles BDB',
  },
  migrations: {
    down: IMPOSSIBLE,
  },
})
