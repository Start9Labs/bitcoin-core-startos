import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '31.3:0',
  releaseNotes: {
    en_US:
      'Updated Bitcoin Core to 31.3, a maintenance release that makes transaction relay more efficient by ignoring duplicate transaction announcements from peers. Full notes: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.3.md',
    es_ES:
      'Bitcoin Core se actualiza a 31.3, una versión de mantenimiento que hace más eficiente la retransmisión de transacciones al ignorar los anuncios de transacciones duplicados de los pares. Notas completas: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.3.md',
    de_DE:
      'Bitcoin Core wurde auf 31.3 aktualisiert, ein Wartungsrelease, das die Weiterleitung von Transaktionen effizienter macht, indem doppelte Transaktionsankündigungen von Peers ignoriert werden. Vollständige Hinweise: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.3.md',
    pl_PL:
      'Zaktualizowano Bitcoin Core do wersji 31.3 – wydania serwisowego, które usprawnia przekazywanie transakcji dzięki ignorowaniu zduplikowanych ogłoszeń transakcji od peerów. Pełne informacje: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.3.md',
    fr_FR:
      'Bitcoin Core passe à la version 31.3, une version de maintenance qui rend le relais des transactions plus efficace en ignorant les annonces de transactions en double provenant des pairs. Notes complètes : https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.3.md',
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
  .satisfies('30.4:4')
  .satisfies('29.5:4')
  .satisfies('28.4:42')
