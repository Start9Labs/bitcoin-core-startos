import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.5:8',
  releaseNotes: {
    en_US:
      'ZeroMQ notifications are no longer reachable from your local network, and, once Tor is updated to 0.4.9.17:3 or later, no longer over a .onion address either. The ZeroMQ Block and ZeroMQ Transaction interfaces are removed. Services that use ZeroMQ, such as LND, are unaffected. Bitcoin now starts after a switch from Bitcoin Core 31 or later.',
    es_ES:
      'Las notificaciones ZeroMQ ya no son accesibles desde su red local y, una vez que Tor se actualice a 0.4.9.17:3 o posterior, tampoco a través de una dirección .onion. Se eliminan las interfaces Bloque ZeroMQ y Transacción ZeroMQ. Los servicios que usan ZeroMQ, como LND, no se ven afectados. Bitcoin ahora se inicia tras cambiar desde Bitcoin Core 31 o posterior.',
    de_DE:
      'ZeroMQ-Benachrichtigungen sind nicht mehr aus Ihrem lokalen Netzwerk erreichbar und, sobald Tor auf 0.4.9.17:3 oder neuer aktualisiert ist, auch nicht mehr über eine .onion-Adresse. Die Schnittstellen ZeroMQ-Block und ZeroMQ-Transaktion wurden entfernt. Dienste, die ZeroMQ nutzen, etwa LND, sind nicht betroffen. Bitcoin startet jetzt nach einem Wechsel von Bitcoin Core 31 oder neuer.',
    pl_PL:
      'Powiadomienia ZeroMQ nie są już dostępne z sieci lokalnej, a po aktualizacji Tor do wersji 0.4.9.17:3 lub nowszej również nie przez adres .onion. Usunięto interfejsy Blok ZeroMQ i Transakcja ZeroMQ. Usługi korzystające z ZeroMQ, takie jak LND, działają bez zmian. Bitcoin uruchamia się teraz po przejściu z Bitcoin Core 31 lub nowszego.',
    fr_FR:
      'Les notifications ZeroMQ ne sont plus accessibles depuis votre réseau local et, une fois Tor mis à jour en 0.4.9.17:3 ou une version ultérieure, ne le sont plus non plus via une adresse .onion. Les interfaces Bloc ZeroMQ et Transaction ZeroMQ sont supprimées. Les services qui utilisent ZeroMQ, comme LND, ne sont pas affectés. Bitcoin démarre désormais après un passage depuis Bitcoin Core 31 ou une version ultérieure.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
}).satisfies('28.4:42')
