import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:5',
  releaseNotes: {
    en_US: `Fixes on-demand fetching of pruned blocks.

A pruned node keeps only recent blocks, so this package bundles a proxy that fetches any older block from the peer-to-peer network the moment something asks for it — that is what lets a Lightning node, Electrum server or block explorer work against a pruned node. The proxy was running, but the fetching itself was never switched on, so any request for a block older than your prune depth simply failed. LND, for one, could never finish building its channel graph. Those requests are now served as intended. The fetch is also cheaper: a block is pulled from a few peers rather than all of them at once. Unpruned nodes are unaffected — they never run the proxy.`,
    es_ES: `Corrige la obtención bajo demanda de bloques podados.

Un nodo podado solo conserva los bloques recientes, por lo que este paquete incluye un proxy que descarga cualquier bloque más antiguo de la red entre pares en cuanto algo lo solicita: eso es lo que permite que un nodo Lightning, un servidor Electrum o un explorador de bloques funcionen contra un nodo podado. El proxy estaba en marcha, pero esa descarga nunca llegó a activarse, así que cualquier petición de un bloque anterior a tu profundidad de poda fallaba sin más. LND, por ejemplo, nunca lograba terminar de construir su grafo de canales. Esas peticiones ya se atienden como corresponde. La descarga también es más económica: un bloque se solicita a unos pocos pares en lugar de a todos a la vez. Los nodos sin podar no se ven afectados: nunca ejecutan el proxy.`,
    de_DE: `Behebt das bedarfsgesteuerte Nachladen beschnittener Blöcke.

Ein beschnittener Knoten behält nur die jüngsten Blöcke, deshalb bringt dieses Paket einen Proxy mit, der jeden älteren Block in dem Moment aus dem Peer-to-Peer-Netz nachlädt, in dem etwas ihn anfordert — genau das lässt einen Lightning-Knoten, einen Electrum-Server oder einen Block-Explorer mit einem beschnittenen Knoten arbeiten. Der Proxy lief zwar, das Nachladen selbst war aber nie eingeschaltet, sodass jede Anfrage nach einem Block jenseits deiner Prune-Tiefe schlicht fehlschlug. LND etwa konnte seinen Kanalgraphen nie fertig aufbauen. Diese Anfragen werden jetzt wie vorgesehen bedient. Das Nachladen ist außerdem sparsamer: Ein Block wird von einigen wenigen Gegenstellen geholt statt von allen gleichzeitig. Unbeschnittene Knoten sind nicht betroffen — sie starten den Proxy nie.`,
    pl_PL: `Naprawia pobieranie na żądanie bloków usuniętych przez przycinanie.

Węzeł z włączonym przycinaniem przechowuje tylko najnowsze bloki, dlatego pakiet zawiera proxy, które pobiera każdy starszy blok z sieci peer-to-peer w chwili, gdy coś go zażąda — to właśnie pozwala węzłowi Lightning, serwerowi Electrum czy eksploratorowi bloków działać na przyciętym węźle. Proxy działało, ale samo pobieranie nigdy nie zostało włączone, więc każde żądanie bloku starszego niż twoja głębokość przycinania po prostu kończyło się błędem. LND na przykład nigdy nie potrafił dokończyć budowy swojego grafu kanałów. Te żądania są już obsługiwane zgodnie z założeniem. Samo pobieranie jest też tańsze: blok jest ściągany od kilku węzłów zamiast od wszystkich naraz. Węzłów bez przycinania to nie dotyczy — nigdy nie uruchamiają proxy.`,
    fr_FR: `Corrige la récupération à la demande des blocs élagués.

Un nœud élagué ne conserve que les blocs récents ; ce paquet embarque donc un proxy qui récupère n'importe quel bloc plus ancien sur le réseau pair-à-pair dès que quelque chose le demande — c'est ce qui permet à un nœud Lightning, un serveur Electrum ou un explorateur de blocs de fonctionner avec un nœud élagué. Le proxy tournait, mais cette récupération n'a jamais été activée : toute demande d'un bloc antérieur à votre profondeur d'élagage échouait purement et simplement. LND, par exemple, ne parvenait jamais à terminer la construction de son graphe de canaux. Ces demandes sont désormais servies comme prévu. La récupération est aussi moins coûteuse : un bloc est demandé à quelques pairs plutôt qu'à tous à la fois. Les nœuds non élagués ne sont pas concernés : ils n'exécutent jamais le proxy.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {
      // v31 changed CURRENT_FEES_FILE_VERSION (149900 → 309900) and the
      // fee estimator bucket size; ≤30 hard-fails on a v31-written file.
      await rm('/media/startos/volumes/main/fee_estimates.dat', {
        force: true,
      }).catch(console.error)
    },
  },
})
  .satisfies('30.3:5')
  .satisfies('29.4:5')
  .satisfies('28.4:18')
