import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '30.4:1',
  releaseNotes: {
    en_US:
      'A new Background Validation health check shows progress while Bitcoin validates the blocks beneath a UTXO snapshot. The Sync Complete notification arrives once that finishes.',
    es_ES:
      'Una nueva comprobación de salud, Validación en segundo plano, muestra el progreso mientras Bitcoin valida los bloques anteriores a una instantánea UTXO. La notificación Sincronización completa llega cuando termina.',
    de_DE:
      'Eine neue Statusprüfung, Hintergrundvalidierung, zeigt den Fortschritt, während Bitcoin die Blöcke unterhalb eines UTXO-Snapshots validiert. Die Benachrichtigung „Synchronisierung abgeschlossen“ erscheint, sobald dies beendet ist.',
    pl_PL:
      'Nowa kontrola stanu, Walidacja w tle, pokazuje postęp, gdy Bitcoin weryfikuje bloki poniżej migawki UTXO. Powiadomienie Synchronizacja zakończona pojawia się po jej ukończeniu.',
    fr_FR:
      'Une nouvelle vérification de santé, Validation en arrière-plan, affiche la progression pendant que Bitcoin valide les blocs antérieurs à un instantané UTXO. La notification Synchronisation terminée arrive une fois celle-ci achevée.',
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
  .satisfies('29.4:16')
  .satisfies('28.4:29')
