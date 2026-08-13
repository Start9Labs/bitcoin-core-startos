import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:7',
  releaseNotes: {
    en_US: `Fixes a serious fault in the two previous revisions: on a pruned node, every request for a block failed — including for blocks your node still had on disk.

Those revisions switched on the on-demand fetching of pruned blocks. On Bitcoin Core 31 that broke the ordinary case along with it. Anything reading blocks through this node was affected: a Lightning node stopped seeing new blocks and reported itself out of sync, and Electrum servers, block explorers and mining software would have failed the same way. Unpruned nodes were never affected — they do not run the proxy that does the fetching.

Underneath, the proxy could no longer read the list of peers your node is connected to, because Bitcoin Core 31 stopped reporting a field the proxy insisted on. It asked for that list before checking whether your own node still had the block, so that one failure took every request down with it. The proxy now asks your node first and turns to the network only for blocks that were genuinely pruned away, it no longer depends on fields Bitcoin Core may stop sending, and it writes its own errors to the service log instead of failing silently.

If you run a pruned node with Lightning, update as soon as you can. While affected, the node cannot see new blocks, and a Lightning node that cannot see new blocks cannot react to a channel being closed against it.`,
    es_ES: `Corrige un fallo grave de las dos revisiones anteriores: en un nodo podado, toda petición de un bloque fallaba, incluidos los bloques que tu nodo aún conservaba en disco.

Esas revisiones activaron la descarga bajo demanda de bloques podados. En Bitcoin Core 31 eso rompió de paso el caso corriente. Se vio afectado todo lo que lee bloques a través de este nodo: un nodo Lightning dejó de ver bloques nuevos y se declaraba fuera de sincronía, y los servidores Electrum, los exploradores de bloques y el software de minería habrían fallado igual. Los nodos sin podar nunca se vieron afectados: no ejecutan el proxy que hace la descarga.

Por debajo, el proxy ya no podía leer la lista de pares a los que está conectado tu nodo, porque Bitcoin Core 31 dejó de informar de un campo que el proxy exigía. Pedía esa lista antes de comprobar si tu propio nodo todavía tenía el bloque, así que ese único fallo se llevaba por delante todas las peticiones. Ahora el proxy pregunta primero a tu nodo y solo recurre a la red para los bloques realmente podados, ya no depende de campos que Bitcoin Core pueda dejar de enviar, y escribe sus propios errores en el registro del servicio en lugar de fallar en silencio.

Si tienes un nodo podado con Lightning, actualiza cuanto antes. Mientras esté afectado, el nodo no puede ver bloques nuevos, y un nodo Lightning que no ve bloques nuevos no puede reaccionar a que le cierren un canal en su contra.`,
    de_DE: `Behebt einen schwerwiegenden Fehler der beiden vorigen Revisionen: Auf einem beschnittenen Knoten schlug jede Anfrage nach einem Block fehl — auch nach Blöcken, die dein Knoten noch auf der Festplatte hatte.

Diese Revisionen schalteten das bedarfsweise Nachladen beschnittener Blöcke ein. Unter Bitcoin Core 31 zerbrach damit auch der gewöhnliche Fall. Betroffen war alles, was Blöcke über diesen Knoten liest: Ein Lightning-Knoten sah keine neuen Blöcke mehr und meldete sich als nicht mehr synchron, und Electrum-Server, Block-Explorer und Mining-Software wären genauso gescheitert. Unbeschnittene Knoten waren nie betroffen — sie starten den Proxy, der das Nachladen erledigt, gar nicht erst.

Darunter lag: Der Proxy konnte die Liste der Gegenstellen, mit denen dein Knoten verbunden ist, nicht mehr lesen, weil Bitcoin Core 31 ein Feld nicht mehr meldet, auf dem der Proxy bestand. Er forderte diese Liste an, bevor er prüfte, ob dein eigener Knoten den Block noch hat — dieser eine Fehler riss deshalb jede Anfrage mit. Der Proxy fragt nun zuerst deinen Knoten und wendet sich nur für tatsächlich beschnittene Blöcke ans Netz, er hängt nicht mehr an Feldern, die Bitcoin Core einstellen kann, und er schreibt seine eigenen Fehler ins Dienstprotokoll, statt stumm zu scheitern.

Wenn du einen beschnittenen Knoten mit Lightning betreibst, aktualisiere so bald wie möglich. Solange er betroffen ist, sieht der Knoten keine neuen Blöcke — und ein Lightning-Knoten, der keine neuen Blöcke sieht, kann nicht darauf reagieren, dass ein Kanal gegen ihn geschlossen wird.`,
    pl_PL: `Naprawia poważną usterkę dwóch poprzednich rewizji: na węźle z przycinaniem każde żądanie bloku kończyło się błędem — także dla bloków, które twój węzeł wciąż miał na dysku.

Te rewizje włączyły pobieranie przyciętych bloków na żądanie. W Bitcoin Core 31 zepsuło to przy okazji przypadek zwyczajny. Ucierpiało wszystko, co czyta bloki przez ten węzeł: węzeł Lightning przestał widzieć nowe bloki i zgłaszał się jako niezsynchronizowany, a serwery Electrum, eksploratory bloków i oprogramowanie górnicze zawiodłyby tak samo. Węzłów bez przycinania to nigdy nie dotyczyło — nie uruchamiają proxy, które pobiera bloki.

Pod spodem proxy nie potrafiło już odczytać listy węzłów, z którymi łączy się twój węzeł, ponieważ Bitcoin Core 31 przestał podawać pole, którego proxy wymagało. Pytało o tę listę, zanim sprawdziło, czy twój własny węzeł nadal ma dany blok, więc ta jedna awaria pociągała za sobą każde żądanie. Teraz proxy pyta najpierw twój węzeł, a do sieci zwraca się wyłącznie po bloki faktycznie przycięte, nie zależy już od pól, których Bitcoin Core może przestać wysyłać, i zapisuje własne błędy w dzienniku usługi zamiast milczeć.

Jeśli prowadzisz węzeł z przycinaniem razem z Lightning, zaktualizuj jak najszybciej. Dopóki usterka trwa, węzeł nie widzi nowych bloków, a węzeł Lightning, który nie widzi nowych bloków, nie może zareagować na zamknięcie kanału na jego niekorzyść.`,
    fr_FR: `Corrige une panne grave des deux révisions précédentes : sur un nœud élagué, toute demande de bloc échouait — y compris pour les blocs que votre nœud avait encore sur disque.

Ces révisions ont activé la récupération à la demande des blocs élagués. Sous Bitcoin Core 31, cela a cassé du même coup le cas ordinaire. Tout ce qui lit des blocs à travers ce nœud était touché : un nœud Lightning ne voyait plus les nouveaux blocs et se déclarait désynchronisé, et les serveurs Electrum, les explorateurs de blocs et les logiciels de minage auraient échoué de la même façon. Les nœuds non élagués n'ont jamais été concernés : ils n'exécutent pas le proxy qui effectue la récupération.

En dessous, le proxy ne parvenait plus à lire la liste des pairs auxquels votre nœud est connecté, parce que Bitcoin Core 31 a cessé de publier un champ que le proxy exigeait. Il demandait cette liste avant de vérifier si votre propre nœud avait encore le bloc : cette seule panne emportait donc toutes les demandes. Le proxy interroge maintenant votre nœud d'abord et ne se tourne vers le réseau que pour les blocs réellement élagués, il ne dépend plus de champs que Bitcoin Core peut cesser d'envoyer, et il consigne ses propres erreurs dans le journal du service au lieu d'échouer en silence.

Si vous exploitez un nœud élagué avec Lightning, mettez à jour dès que possible. Tant qu'il est touché, le nœud ne voit pas les nouveaux blocs, et un nœud Lightning qui ne voit pas les nouveaux blocs ne peut pas réagir à la fermeture d'un canal à son encontre.`,
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
  .satisfies('30.3:7')
  .satisfies('29.4:7')
  .satisfies('28.4:20')
