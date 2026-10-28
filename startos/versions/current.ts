import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.5:0',
  releaseNotes: {
    en_US:
      'Updated Bitcoin Core to 29.5. Fixes peer connection timeouts and socket error monitoring, updates DNS seed discovery to assume v2 transport, and uses 64-bit block-file positions. Full release notes: https://github.com/bitcoin/bitcoin/blob/v29.5/doc/release-notes.md',
    es_ES:
      'Bitcoin Core actualizado a 29.5. Corrige los tiempos de espera de las conexiones con pares y la detección de errores de sockets, actualiza el descubrimiento mediante semillas DNS para asumir el transporte v2 y usa posiciones de 64 bits en los archivos de bloques. Notas completas: https://github.com/bitcoin/bitcoin/blob/v29.5/doc/release-notes.md',
    de_DE:
      'Bitcoin Core auf 29.5 aktualisiert. Behebt Zeitüberschreitungen bei Peer-Verbindungen und die Überwachung von Socket-Fehlern, nimmt bei der Peer-Suche über DNS-Seeds v2-Transport an und verwendet 64-Bit-Positionen in Blockdateien. Vollständige Versionshinweise: https://github.com/bitcoin/bitcoin/blob/v29.5/doc/release-notes.md',
    pl_PL:
      'Zaktualizowano Bitcoin Core do 29.5. Poprawiono limity czasu połączeń z peerami i monitorowanie błędów gniazd, wyszukiwanie peerów przez serwery DNS zakłada teraz transport v2, a pozycje w plikach bloków używają 64 bitów. Pełne informacje o wydaniu: https://github.com/bitcoin/bitcoin/blob/v29.5/doc/release-notes.md',
    fr_FR:
      'Bitcoin Core mis à jour vers 29.5. Corrige les délais des connexions aux pairs et la surveillance des erreurs de sockets, suppose le transport v2 lors de la découverte via les serveurs DNS et utilise des positions sur 64 bits dans les fichiers de blocs. Notes complètes : https://github.com/bitcoin/bitcoin/blob/v29.5/doc/release-notes.md',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
}).satisfies('28.4:29')
