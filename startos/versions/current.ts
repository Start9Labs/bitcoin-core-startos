import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:47',
  releaseNotes: {
    en_US:
      "On disks under roughly 900 GB, the Pruning setting can't be left empty. An existing archival configuration is not changed. Peers that connect through your .onion address learn only that address, never your public IP address, and a misbehaving one is disconnected without affecting your other onion peers. Requires Tor 0.4.9.17:4 or later.",
    es_ES:
      'En discos de menos de unos 900 GB, el ajuste Poda no puede quedar vacío. Una configuración de archivo existente no se modifica. Los pares que se conectan a través de su dirección .onion solo conocen esa dirección, nunca su dirección IP pública, y uno que se comporte mal se desconecta sin afectar a sus demás pares onion. Requiere Tor 0.4.9.17:4 o posterior.',
    de_DE:
      'Auf Datenträgern unter etwa 900 GB darf die Einstellung Beschneidung nicht leer bleiben. Eine bestehende Archivkonfiguration wird nicht geändert. Peers, die sich über Ihre .onion-Adresse verbinden, erfahren nur diese Adresse, nie Ihre öffentliche IP-Adresse, und ein Peer, der sich fehlverhält, wird getrennt, ohne Ihre anderen Onion-Peers zu beeinträchtigen. Erfordert Tor 0.4.9.17:4 oder neuer.',
    pl_PL:
      'Na dyskach mniejszych niż około 900 GB ustawienie Przycinanie nie może pozostać puste. Istniejąca konfiguracja archiwalna nie jest zmieniana. Węzły łączące się przez Twój adres .onion poznają tylko ten adres, nigdy Twojego publicznego adresu IP, a węzeł, który źle się zachowuje, zostaje rozłączony bez wpływu na pozostałe węzły onion. Wymaga Tor 0.4.9.17:4 lub nowszego.',
    fr_FR:
      'Sur les disques de moins de 900 Go environ, le réglage Élagage ne peut pas rester vide. Une configuration archivale existante n’est pas modifiée. Les pairs qui se connectent via votre adresse .onion ne connaissent que cette adresse, jamais votre adresse IP publique, et un pair au comportement abusif est déconnecté sans affecter vos autres pairs onion. Nécessite Tor 0.4.9.17:4 ou une version ultérieure.',
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
