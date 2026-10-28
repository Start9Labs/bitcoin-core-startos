import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '30.4:0',
  releaseNotes: {
    en_US:
      'Updated Bitcoin Core to 30.4. Suppresses unknown soft-fork warnings for version bits reserved by BIP 323, improves peer discovery and connection timeout handling, and uses 64-bit block-file positions. Full release notes: https://github.com/bitcoin/bitcoin/blob/v30.4/doc/release-notes.md',
    es_ES:
      'Bitcoin Core actualizado a 30.4. Suprime las advertencias de bifurcaciones suaves desconocidas para los bits de versión reservados por BIP 323, mejora el descubrimiento de pares y la gestión de los tiempos de espera de conexión, y usa posiciones de 64 bits en los archivos de bloques. Notas completas: https://github.com/bitcoin/bitcoin/blob/v30.4/doc/release-notes.md',
    de_DE:
      'Bitcoin Core auf 30.4 aktualisiert. Unterdrückt Warnungen vor unbekannten Soft Forks für die durch BIP 323 reservierten Versionsbits, verbessert die Peer-Erkennung und die Behandlung von Verbindungszeitüberschreitungen und verwendet 64-Bit-Positionen in Blockdateien. Vollständige Versionshinweise: https://github.com/bitcoin/bitcoin/blob/v30.4/doc/release-notes.md',
    pl_PL:
      'Zaktualizowano Bitcoin Core do 30.4. Usunięto ostrzeżenia o nieznanych soft forkach dla bitów wersji zarezerwowanych przez BIP 323, poprawiono wykrywanie peerów i obsługę limitów czasu połączeń oraz zastosowano 64-bitowe pozycje w plikach bloków. Pełne informacje o wydaniu: https://github.com/bitcoin/bitcoin/blob/v30.4/doc/release-notes.md',
    fr_FR:
      'Bitcoin Core mis à jour vers 30.4. Supprime les avertissements de soft forks inconnus pour les bits de version réservés par BIP 323, améliore la découverte des pairs et la gestion des délais de connexion, et utilise des positions sur 64 bits dans les fichiers de blocs. Notes de version complètes : https://github.com/bitcoin/bitcoin/blob/v30.4/doc/release-notes.md',
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
  .satisfies('29.4:16')
  .satisfies('28.4:29')
