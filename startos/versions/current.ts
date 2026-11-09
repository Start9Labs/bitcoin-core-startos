import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '31.2:3',
  releaseNotes: {
    en_US:
      "Requires StartOS 0.4.1 or later. Peers and ZMQ clients can now connect over the server's IPv6 addresses.",
    es_ES:
      'Requiere StartOS 0.4.1 o posterior. Los pares y los clientes ZMQ ahora pueden conectarse a través de las direcciones IPv6 del servidor.',
    de_DE:
      'Erfordert StartOS 0.4.1 oder neuer. Peers und ZMQ-Clients können sich jetzt über die IPv6-Adressen des Servers verbinden.',
    pl_PL:
      'Wymaga StartOS 0.4.1 lub nowszego. Peery i klienci ZMQ mogą teraz łączyć się przez adresy IPv6 serwera.',
    fr_FR:
      'Nécessite StartOS 0.4.1 ou une version ultérieure. Les pairs et les clients ZMQ peuvent désormais se connecter via les adresses IPv6 du serveur.',
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
  .satisfies('30.3:16')
  .satisfies('29.4:16')
  .satisfies('28.4:29')
