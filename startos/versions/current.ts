import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '31.2:0',
  releaseNotes: {
    en_US:
      'Updated Bitcoin Core to 31.2 with chainstate and peer-connection fixes and BIP 323 version-bit warning suppression. When Private Broadcast is enabled, its queue is now limited to 10,000 transactions; further submissions are rejected until space is freed. RPC clients should inspect getprivatebroadcastinfo and use abortprivatebroadcast for stuck entries. Full release notes: https://github.com/bitcoin/bitcoin/blob/v31.2/doc/release-notes.md',
    es_ES:
      'Bitcoin Core actualizado a 31.2 con correcciones del estado de la cadena y las conexiones con pares, y supresión de advertencias de bits de versión según BIP 323. Con Difusión privada activada, su cola se limita ahora a 10.000 transacciones; se rechazan nuevos envíos hasta liberar espacio. Los clientes RPC deben consultar getprivatebroadcastinfo y usar abortprivatebroadcast para entradas atascadas. Notas completas: https://github.com/bitcoin/bitcoin/blob/v31.2/doc/release-notes.md',
    de_DE:
      'Bitcoin Core auf 31.2 aktualisiert: Korrekturen am Chainstate und an Peer-Verbindungen sowie Unterdrückung von Versionsbit-Warnungen gemäß BIP 323. Bei aktivierter privater Übertragung ist die Warteschlange jetzt auf 10.000 Transaktionen begrenzt; weitere Einreichungen werden abgewiesen, bis Platz frei wird. RPC-Clients sollten getprivatebroadcastinfo prüfen und abortprivatebroadcast für festhängende Einträge verwenden. Vollständige Versionshinweise: https://github.com/bitcoin/bitcoin/blob/v31.2/doc/release-notes.md',
    pl_PL:
      'Zaktualizowano Bitcoin Core do 31.2: poprawki stanu łańcucha i połączeń z peerami oraz wyciszenie ostrzeżeń o bitach wersji zgodnie z BIP 323. Przy włączonym rozgłaszaniu prywatnym kolejka jest teraz ograniczona do 10 000 transakcji; kolejne zgłoszenia są odrzucane do zwolnienia miejsca. Klienci RPC powinni sprawdzać getprivatebroadcastinfo i używać abortprivatebroadcast dla zablokowanych wpisów. Pełne informacje o wydaniu: https://github.com/bitcoin/bitcoin/blob/v31.2/doc/release-notes.md',
    fr_FR:
      'Bitcoin Core passe à la version 31.2 avec des correctifs de l’état de la chaîne et des connexions aux pairs, et la suppression des avertissements de bits de version selon BIP 323. Lorsque la diffusion privée est activée, sa file est désormais limitée à 10 000 transactions ; les envois supplémentaires sont refusés tant que de la place n’est pas libérée. Les clients RPC doivent consulter getprivatebroadcastinfo et utiliser abortprivatebroadcast pour les entrées bloquées. Notes complètes : https://github.com/bitcoin/bitcoin/blob/v31.2/doc/release-notes.md',
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
  .satisfies('30.3:16')
  .satisfies('29.4:16')
  .satisfies('28.4:29')
