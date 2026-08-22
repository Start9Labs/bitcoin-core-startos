import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:11',
  releaseNotes: {
    en_US: `Fixes a settings combination that could leave the node unable to start.

- Onlynet no longer keeps i2p selected while the I2P SAM Proxy is disabled. Bitcoin refuses to start when its outbound connections are restricted to a network it has no proxy for: it prints an error and exits as soon as it reads the file, so the node restarted over and over, with nothing in the package pointing back at the Onlynet checkbox. Turning the proxy off after an I2P error — the natural reaction to one — was enough to trigger it. i2p is now dropped from the selection instead, and updating repairs a node already stuck this way.
- Dropping it never widens the node's reach. An Onlynet with nothing left in it is no restriction at all, so a node confined to i2p alone keeps its I2P proxy rather than being handed Tor and clearnet: Peer Settings refuses to disable the proxy while i2p is the only network selected, and a node already in that state has its proxy address restored when the file is next written. It also covers a network the package does not offer: cjdns hand-written into bitcoin.conf used to take the whole Onlynet line with it, and is now left where it stands.`,
    es_ES: `Corrige una combinación de ajustes que podía dejar el nodo sin poder arrancar.

- Onlynet ya no mantiene i2p seleccionado mientras el proxy SAM de I2P está desactivado. Bitcoin se niega a arrancar cuando sus conexiones salientes quedan restringidas a una red para la que no tiene proxy: imprime un error y termina en cuanto lee el archivo, así que el nodo se reiniciaba una y otra vez, sin que nada en el paquete señalara la casilla de Onlynet. Desactivar el proxy tras un error de I2P —la reacción natural ante uno— bastaba para provocarlo. Ahora i2p se elimina de la selección, y actualizar repara un nodo que ya esté atascado así.
- Esa eliminación nunca amplía el alcance del nodo. Un Onlynet sin nada dentro no es ninguna restricción, así que un nodo limitado solo a i2p conserva su proxy de I2P en lugar de recibir Tor y la red abierta: Ajustes de pares rechaza desactivar el proxy mientras i2p sea la única red seleccionada, y a un nodo que ya esté en ese estado se le restaura la dirección del proxy la próxima vez que se escriba el archivo. Lo mismo vale para una red que el paquete no ofrece: cjdns escrito a mano en bitcoin.conf se llevaba por delante toda la línea de Onlynet, y ahora se deja tal cual.`,
    de_DE: `Behebt eine Einstellungskombination, die den Knoten am Start hindern konnte.

- Onlynet behält i2p nicht mehr ausgewählt, während der I2P-SAM-Proxy deaktiviert ist. Bitcoin startet nicht, wenn seine ausgehenden Verbindungen auf ein Netzwerk beschränkt sind, für das es keinen Proxy hat: Es gibt einen Fehler aus und beendet sich, sobald es die Datei liest, sodass der Knoten immer wieder neu startete, ohne dass irgendetwas im Paket auf das Onlynet-Kästchen verwies. Den Proxy nach einem I2P-Fehler abzuschalten — die naheliegende Reaktion darauf — genügte bereits. i2p wird jetzt stattdessen aus der Auswahl entfernt, und ein Update repariert einen bereits so festhängenden Knoten.
- Dieses Entfernen weitet die Reichweite des Knotens nie aus. Ein leeres Onlynet ist überhaupt keine Beschränkung, deshalb behält ein allein auf i2p beschränkter Knoten seinen I2P-Proxy, statt Tor und Klarnetz zu bekommen: Die Peer-Einstellungen verweigern das Abschalten des Proxys, solange i2p das einzige ausgewählte Netzwerk ist, und einem bereits in diesem Zustand befindlichen Knoten wird die Proxy-Adresse beim nächsten Schreiben der Datei wiederhergestellt. Das gilt auch für ein Netzwerk, das dieses Paket nicht anbietet: Ein von Hand in die bitcoin.conf geschriebenes cjdns riss bisher die ganze Onlynet-Zeile mit sich und bleibt nun unangetastet stehen.`,
    pl_PL: `Naprawia kombinację ustawień, która mogła uniemożliwić uruchomienie węzła.

- Onlynet nie utrzymuje już zaznaczonego i2p, gdy proxy SAM I2P jest wyłączone. Bitcoin nie uruchomi się, gdy jego połączenia wychodzące są ograniczone do sieci, dla której nie ma proxy: wypisuje błąd i kończy działanie zaraz po odczytaniu pliku, więc węzeł uruchamiał się w kółko, a nic w pakiecie nie wskazywało na pole Onlynet. Wyłączenie proxy po błędzie I2P — naturalna reakcja na taki błąd — w zupełności wystarczało. Teraz i2p jest zamiast tego usuwane z wyboru, a aktualizacja naprawia węzeł, który już w ten sposób utknął.
- Takie usunięcie nigdy nie poszerza zasięgu węzła. Pusty Onlynet nie jest żadnym ograniczeniem, więc węzeł ograniczony wyłącznie do i2p zachowuje swoje proxy I2P, zamiast dostać Tora i sieć jawną: Ustawienia peerów odmawiają wyłączenia proxy, dopóki i2p jest jedyną wybraną siecią, a węzłowi, który już jest w tym stanie, adres proxy zostaje przywrócony przy najbliższym zapisie pliku. To samo dotyczy sieci, której pakiet nie oferuje: wpisane ręcznie do bitcoin.conf cjdns zabierało dotąd ze sobą całą linię Onlynet, a teraz zostaje nietknięte.`,
    fr_FR: `Corrige une combinaison de réglages qui pouvait empêcher le nœud de démarrer.

- Onlynet ne conserve plus i2p sélectionné tant que le proxy SAM I2P est désactivé. Bitcoin refuse de démarrer lorsque ses connexions sortantes sont restreintes à un réseau pour lequel il n'a pas de proxy : il affiche une erreur et s'arrête dès qu'il lit le fichier, de sorte que le nœud redémarrait sans fin, sans que rien dans le paquet ne renvoie à la case Onlynet. Désactiver le proxy après une erreur I2P — la réaction naturelle — suffisait à le provoquer. i2p est désormais retiré de la sélection, et la mise à jour répare un nœud déjà bloqué de cette façon.
- Ce retrait n'élargit jamais la portée du nœud. Un Onlynet vide n'est plus aucune restriction, aussi un nœud confiné au seul i2p garde-t-il son proxy I2P au lieu de se voir attribuer Tor et le réseau en clair : les Réglages des pairs refusent de désactiver le proxy tant qu'i2p est le seul réseau sélectionné, et un nœud déjà dans cet état voit l'adresse de son proxy rétablie à la prochaine écriture du fichier. Cela vaut aussi pour un réseau que le paquet ne propose pas : un cjdns écrit à la main dans bitcoin.conf emportait jusqu'ici toute la ligne Onlynet, et reste désormais tel quel.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {
      // v30 introduced indexes/coinstatsindex/ at a new path; ≤29 doesn't read it.
      // Core preserved indexes/coinstats/ on upgrade for exactly this rollback.
      await rm('/media/startos/volumes/main/indexes/coinstatsindex', {
        recursive: true,
        force: true,
      }).catch(console.error)
    },
  },
})
  .satisfies('29.4:11')
  .satisfies('28.4:24')
