import { clearOnionTarget } from 'tor-startos/startos/utils/target'
import { onionBinding } from '../init/onionTarget'
import { sdk } from '../sdk'
import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.5:10',
  releaseNotes: {
    en_US:
      'Peers that connect through your .onion address learn only that address, never your public IP address, and a misbehaving one is disconnected without affecting your other onion peers. Requires Tor 0.4.9.17:4 or later.',
    es_ES:
      'Los pares que se conectan a través de su dirección .onion solo conocen esa dirección, nunca su dirección IP pública, y uno que se comporte mal se desconecta sin afectar a sus demás pares onion. Requiere Tor 0.4.9.17:4 o posterior.',
    de_DE:
      'Peers, die sich über Ihre .onion-Adresse verbinden, erfahren nur diese Adresse, nie Ihre öffentliche IP-Adresse, und ein Peer, der sich fehlverhält, wird getrennt, ohne Ihre anderen Onion-Peers zu beeinträchtigen. Erfordert Tor 0.4.9.17:4 oder neuer.',
    pl_PL:
      'Węzły łączące się przez Twój adres .onion poznają tylko ten adres, nigdy Twojego publicznego adresu IP, a węzeł, który źle się zachowuje, zostaje rozłączony bez wpływu na pozostałe węzły onion. Wymaga Tor 0.4.9.17:4 lub nowszego.',
    fr_FR:
      'Les pairs qui se connectent via votre adresse .onion ne connaissent que cette adresse, jamais votre adresse IP publique, et un pair au comportement abusif est déconnecté sans affecter vos autres pairs onion. Nécessite Tor 0.4.9.17:4 ou une version ultérieure.',
  },
  migrations: {
    up: async ({ effects }) => {},
    // The version rolled back to sets its own target if it has the relay.
    down: async ({ effects }) => clearOnionTarget(sdk, effects, onionBinding),
  },
}).satisfies('28.4:42')
