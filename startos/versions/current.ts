import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:13',
  releaseNotes: {
    en_US:
      'Internal updates (start-sdk 2.0.x). Bitcoin now reaches Tor at a fixed internal bridge address and no longer restarts when Tor is installed, updated, or removed.',
    es_ES:
      'Actualizaciones internas (start-sdk 2.0.x). Bitcoin ahora alcanza Tor en una dirección fija del puente interno y ya no se reinicia cuando Tor se instala, actualiza o elimina.',
    de_DE:
      'Interne Aktualisierungen (start-sdk 2.0.x). Bitcoin erreicht Tor jetzt über eine feste interne Bridge-Adresse und startet nicht mehr neu, wenn Tor installiert, aktualisiert oder entfernt wird.',
    pl_PL:
      'Aktualizacje wewnętrzne (start-sdk 2.0.x). Bitcoin łączy się teraz z Torem pod stałym adresem wewnętrznego mostka i nie restartuje się już przy instalacji, aktualizacji ani usunięciu Tora.',
    fr_FR:
      'Mises à jour internes (start-sdk 2.0.x). Bitcoin atteint désormais Tor à une adresse fixe du pont interne et ne redémarre plus lorsque Tor est installé, mis à jour ou supprimé.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
