import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.5:8',
  releaseNotes: {
    en_US:
      'ZeroMQ notifications are now reachable only by other services on this server, no longer from your local network. The ZeroMQ Block and ZeroMQ Transaction interfaces are removed. Services that use ZeroMQ, such as LND, are unaffected. Bitcoin now starts after a switch from Bitcoin Core 31 or later.',
    es_ES:
      'Las notificaciones ZeroMQ ahora solo son accesibles para otros servicios de este servidor, ya no desde su red local. Se eliminan las interfaces Bloque ZeroMQ y Transacción ZeroMQ. Los servicios que usan ZeroMQ, como LND, no se ven afectados. Bitcoin ahora se inicia tras cambiar desde Bitcoin Core 31 o posterior.',
    de_DE:
      'ZeroMQ-Benachrichtigungen sind jetzt nur noch für andere Dienste auf diesem Server erreichbar, nicht mehr aus Ihrem lokalen Netzwerk. Die Schnittstellen ZeroMQ-Block und ZeroMQ-Transaktion wurden entfernt. Dienste, die ZeroMQ nutzen, etwa LND, sind nicht betroffen. Bitcoin startet jetzt nach einem Wechsel von Bitcoin Core 31 oder neuer.',
    pl_PL:
      'Powiadomienia ZeroMQ są teraz dostępne tylko dla innych usług na tym serwerze, a nie z sieci lokalnej. Usunięto interfejsy Blok ZeroMQ i Transakcja ZeroMQ. Usługi korzystające z ZeroMQ, takie jak LND, działają bez zmian. Bitcoin uruchamia się teraz po przejściu z Bitcoin Core 31 lub nowszego.',
    fr_FR:
      "Les notifications ZeroMQ ne sont désormais accessibles qu'aux autres services de ce serveur, et non plus depuis votre réseau local. Les interfaces Bloc ZeroMQ et Transaction ZeroMQ sont supprimées. Les services qui utilisent ZeroMQ, comme LND, ne sont pas affectés. Bitcoin démarre désormais après un passage depuis Bitcoin Core 31 ou une version ultérieure",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
}).satisfies('28.4:42')
