import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:19',
  releaseNotes: {
    en_US: `Opens up five more Bitcoin Core settings, fixes on-demand fetching of pruned blocks, and repairs the UTXO snapshot download.

Five more Bitcoin Core settings are now editable. Mempool Settings gains Min Transaction Relay Fee and Bytes Per Sigop; Other Settings gains Block Reconstruction Extra TXN, NAT-PMP and Max Upload Target.

A pruned node keeps only recent blocks, so this package bundles a proxy that fetches any older block from the peer-to-peer network the moment something asks for it — that is what lets a Lightning node, Electrum server or block explorer work against a pruned node. The proxy was running, but the fetching itself was never switched on, so any request for a block older than your prune depth simply failed. LND, for one, could never finish building its channel graph. Those requests are now served as intended. The fetch is also cheaper: a block is pulled from a few peers rather than all of them at once. Unpruned nodes are unaffected — they never run the proxy.

The "Download UTXO Snapshot (assumeutxo)" action has also been repaired. Every attempt failed the instant it started, reporting a missing file that had nothing to do with the address you entered — the program the action used to fetch the snapshot was no longer shipped with the service. Downloads now start as intended, and a URL that answers with an error page is reported as a failed download rather than saved as though it were a snapshot. The action is also sturdier around it: a download that stops moving is abandoned rather than leaving the action stuck on "Download in progress", a failure now tells you what went wrong instead of only that it failed, and the snapshot file — around 11 GB — is deleted once Bitcoin has absorbed it.

Separately, three hardening changes from a community security audit.

The check that verifies the signatures on an upstream release now counts distinct signers rather than signatures. Because it counted signatures, one release key signing several times could satisfy a quorum meant to require several independent people — so the tolerance the check advertised was not the tolerance it enforced. Nothing about the releases this package builds changes: each is signed by more than enough separate people to pass either way.

When another service asks to adjust this node's configuration, it can now reach only the handful of settings such a service has any business setting, instead of the entire configuration file. Previously such a request could also carry settings that never appeared on the screen where you approve it.

And an RPC password handed over by another service must now be at least twenty characters. That field is filled in by the service requesting access and you cannot edit it, so nothing was stopping a careless one from choosing something guessable.`,
    es_ES: `Abre cinco ajustes más de Bitcoin Core, corrige la obtención bajo demanda de bloques podados y repara la descarga de la instantánea UTXO.

Cinco ajustes más de Bitcoin Core ya se pueden editar. La Configuración de Mempool incorpora Tarifa mínima de retransmisión de transacciones y Bytes por sigop; Otras configuraciones incorpora Transacciones adicionales para la reconstrucción de bloques, NAT-PMP y Objetivo máximo de subida.

Un nodo podado solo conserva los bloques recientes, por lo que este paquete incluye un proxy que descarga cualquier bloque más antiguo de la red entre pares en cuanto algo lo solicita: eso es lo que permite que un nodo Lightning, un servidor Electrum o un explorador de bloques funcionen contra un nodo podado. El proxy estaba en marcha, pero esa descarga nunca llegó a activarse, así que cualquier petición de un bloque anterior a tu profundidad de poda fallaba sin más. LND, por ejemplo, nunca lograba terminar de construir su grafo de canales. Esas peticiones ya se atienden como corresponde. La descarga también es más económica: un bloque se solicita a unos pocos pares en lugar de a todos a la vez. Los nodos sin podar no se ven afectados: nunca ejecutan el proxy.

También se ha reparado la acción "Descargar instantánea UTXO (assumeutxo)". Todos los intentos fallaban nada más empezar, informando de un archivo inexistente que nada tenía que ver con la dirección introducida: el programa que la acción usaba para descargar la instantánea ya no venía incluido en el servicio. Las descargas ahora arrancan como corresponde, y una URL que responde con una página de error se notifica como descarga fallida en lugar de guardarse como si fuera una instantánea. La acción también es más robusta a su alrededor: una descarga que deja de avanzar se abandona en lugar de dejar la acción atascada en "Descarga en progreso", un fallo ahora te dice qué salió mal y no solo que falló, y el archivo de la instantánea —unos 11 GB— se elimina en cuanto Bitcoin lo ha absorbido.

Aparte de lo anterior, tres mejoras de robustez surgidas de una auditoría de seguridad de la comunidad.

La comprobación que verifica las firmas de una versión oficial ahora cuenta firmantes distintos en lugar de firmas. Como contaba firmas, una sola clave de publicación que firmara varias veces podía satisfacer un quórum pensado para exigir varias personas independientes, de modo que la tolerancia que anunciaba la comprobación no era la que realmente aplicaba. Nada cambia en las versiones que compila este paquete: cada una está firmada por bastantes más personas distintas de las necesarias para pasarla en cualquiera de los dos casos.

Cuando otro servicio solicita ajustar la configuración de este nodo, ahora solo puede llegar al puñado de ajustes que a tal servicio le corresponde tocar, en vez de a todo el archivo de configuración. Antes, esa solicitud también podía llevar ajustes que nunca aparecían en la pantalla donde usted la aprueba.

Además, una contraseña RPC facilitada por otro servicio debe tener ahora al menos veinte caracteres. Ese campo lo rellena el servicio que solicita el acceso y usted no puede editarlo, así que nada impedía que uno descuidado eligiera algo fácil de adivinar.`,
    de_DE: `Öffnet fünf weitere Einstellungen von Bitcoin Core, behebt das bedarfsgesteuerte Nachladen beschnittener Blöcke und repariert den Download des UTXO-Snapshots.

Fünf weitere Einstellungen von Bitcoin Core sind jetzt editierbar. Die Mempool-Einstellungen erhalten Mindestgebühr für die Weiterleitung und Bytes pro Sigop, die Weiteren Einstellungen Zusätzliche Transaktionen für die Blockrekonstruktion, NAT-PMP und Maximales Upload-Ziel.

Ein beschnittener Knoten behält nur die jüngsten Blöcke, deshalb bringt dieses Paket einen Proxy mit, der jeden älteren Block in dem Moment aus dem Peer-to-Peer-Netz nachlädt, in dem etwas ihn anfordert — genau das lässt einen Lightning-Knoten, einen Electrum-Server oder einen Block-Explorer mit einem beschnittenen Knoten arbeiten. Der Proxy lief zwar, das Nachladen selbst war aber nie eingeschaltet, sodass jede Anfrage nach einem Block jenseits deiner Prune-Tiefe schlicht fehlschlug. LND etwa konnte seinen Kanalgraphen nie fertig aufbauen. Diese Anfragen werden jetzt wie vorgesehen bedient. Das Nachladen ist außerdem sparsamer: Ein Block wird von einigen wenigen Gegenstellen geholt statt von allen gleichzeitig. Unbeschnittene Knoten sind nicht betroffen — sie starten den Proxy nie.

Außerdem wurde die Aktion „UTXO-Snapshot herunterladen (assumeutxo)" repariert. Jeder Versuch schlug sofort fehl und meldete eine fehlende Datei, die nichts mit der eingegebenen Adresse zu tun hatte — das Programm, mit dem die Aktion den Snapshot holte, wurde nicht mehr mit dem Dienst ausgeliefert. Downloads starten jetzt wie vorgesehen, und eine URL, die mit einer Fehlerseite antwortet, wird als fehlgeschlagener Download gemeldet, statt als Snapshot gespeichert zu werden. Auch drumherum ist die Aktion robuster: Ein Download, der nicht mehr vorankommt, wird abgebrochen, statt die Aktion bei „Download läuft" hängen zu lassen, ein Fehlschlag nennt jetzt die Ursache statt nur zu melden, dass er fehlschlug, und die Snapshot-Datei — rund 11 GB — wird gelöscht, sobald Bitcoin sie aufgenommen hat.

Davon unabhängig: drei Härtungsänderungen aus einem Sicherheitsaudit der Community.

Die Prüfung der Signaturen einer Upstream-Veröffentlichung zählt jetzt unterschiedliche Signierende statt Signaturen. Da sie Signaturen zählte, konnte ein einzelner Veröffentlichungsschlüssel durch mehrfaches Signieren ein Quorum erfüllen, das mehrere unabhängige Personen verlangen sollte — die Toleranz, die die Prüfung angab, war also nicht die, die sie durchsetzte. An den Veröffentlichungen, die dieses Paket baut, ändert sich nichts: Jede ist von mehr als genug verschiedenen Personen signiert, um so oder so zu bestehen.

Wenn ein anderer Dienst darum bittet, die Konfiguration dieses Knotens anzupassen, erreicht er jetzt nur noch die wenigen Einstellungen, die einen solchen Dienst überhaupt etwas angehen, statt der gesamten Konfigurationsdatei. Zuvor konnte eine solche Anfrage auch Einstellungen enthalten, die auf dem Bildschirm, auf dem Sie sie bestätigen, nie auftauchten.

Und ein von einem anderen Dienst übergebenes RPC-Passwort muss nun mindestens zwanzig Zeichen lang sein. Dieses Feld füllt der anfragende Dienst aus und Sie können es nicht ändern — nichts hielt also einen nachlässigen Dienst davon ab, etwas leicht Erratbares zu wählen.`,
    pl_PL: `Udostępnia pięć kolejnych ustawień Bitcoin Core, naprawia pobieranie na żądanie bloków usuniętych przez przycinanie oraz pobieranie migawki UTXO.

Pięć kolejnych ustawień Bitcoin Core można teraz edytować. Ustawienia Mempool zyskują Minimalną opłatę za przekazywanie transakcji i Bajty na sigop, a Inne ustawienia — Dodatkowe transakcje do rekonstrukcji bloków, NAT-PMP i Maksymalny limit wysyłania.

Węzeł z włączonym przycinaniem przechowuje tylko najnowsze bloki, dlatego pakiet zawiera proxy, które pobiera każdy starszy blok z sieci peer-to-peer w chwili, gdy coś go zażąda — to właśnie pozwala węzłowi Lightning, serwerowi Electrum czy eksploratorowi bloków działać na przyciętym węźle. Proxy działało, ale samo pobieranie nigdy nie zostało włączone, więc każde żądanie bloku starszego niż twoja głębokość przycinania po prostu kończyło się błędem. LND na przykład nigdy nie potrafił dokończyć budowy swojego grafu kanałów. Te żądania są już obsługiwane zgodnie z założeniem. Samo pobieranie jest też tańsze: blok jest ściągany od kilku węzłów zamiast od wszystkich naraz. Węzłów bez przycinania to nie dotyczy — nigdy nie uruchamiają proxy.

Naprawiono również akcję „Pobierz migawkę UTXO (assumeutxo)". Każda próba kończyła się błędem natychmiast po uruchomieniu, zgłaszając brakujący plik niemający nic wspólnego z podanym adresem — program, którym akcja pobierała migawkę, przestał być dostarczany razem z usługą. Pobieranie zaczyna się teraz zgodnie z założeniem, a adres URL zwracający stronę błędu jest zgłaszany jako nieudane pobranie, zamiast zostać zapisany tak, jakby był migawką. Sama akcja jest też odporniejsza: pobieranie, które przestaje postępować, zostaje przerwane, zamiast zostawiać akcję zablokowaną na „Pobieranie w toku", niepowodzenie podaje teraz przyczynę, a nie tylko sam fakt błędu, a plik migawki — około 11 GB — jest usuwany, gdy tylko Bitcoin go wchłonie.

Niezależnie od powyższego: trzy zmiany wzmacniające, wynikające ze społecznościowego audytu bezpieczeństwa.

Kontrola weryfikująca podpisy wydania upstream liczy teraz odrębnych sygnatariuszy, a nie podpisy. Ponieważ liczyła podpisy, jeden klucz wydania podpisujący kilkakrotnie mógł spełnić kworum pomyślane tak, by wymagać kilku niezależnych osób — deklarowana odporność kontroli nie była więc tą, którą faktycznie egzekwowała. W wydaniach budowanych przez ten pakiet nic się nie zmienia: każde jest podpisane przez znacznie więcej odrębnych osób, niż potrzeba do jej przejścia w obu wariantach.

Gdy inna usługa prosi o zmianę konfiguracji tego węzła, może teraz sięgnąć wyłącznie po tę garstkę ustawień, które takiej usługi w ogóle dotyczą, zamiast po cały plik konfiguracyjny. Wcześniej takie żądanie mogło nieść również ustawienia, które nigdy nie pojawiały się na ekranie zatwierdzania.

Hasło RPC przekazane przez inną usługę musi mieć teraz co najmniej dwadzieścia znaków. To pole wypełnia usługa prosząca o dostęp i nie można go edytować, więc nic nie powstrzymywało nieostrożnej usługi przed wybraniem czegoś łatwego do odgadnięcia.`,
    fr_FR: `Ouvre cinq réglages supplémentaires de Bitcoin Core, corrige la récupération à la demande des blocs élagués et répare le téléchargement de l'instantané UTXO.

Cinq réglages supplémentaires de Bitcoin Core sont désormais modifiables. Les Paramètres du Mempool gagnent Frais minimum de relais des transactions et Octets par sigop ; les Autres paramètres gagnent Transactions supplémentaires pour la reconstruction des blocs, NAT-PMP et Objectif maximal d'envoi.

Un nœud élagué ne conserve que les blocs récents ; ce paquet embarque donc un proxy qui récupère n'importe quel bloc plus ancien sur le réseau pair-à-pair dès que quelque chose le demande — c'est ce qui permet à un nœud Lightning, un serveur Electrum ou un explorateur de blocs de fonctionner avec un nœud élagué. Le proxy tournait, mais cette récupération n'a jamais été activée : toute demande d'un bloc antérieur à votre profondeur d'élagage échouait purement et simplement. LND, par exemple, ne parvenait jamais à terminer la construction de son graphe de canaux. Ces demandes sont désormais servies comme prévu. La récupération est aussi moins coûteuse : un bloc est demandé à quelques pairs plutôt qu'à tous à la fois. Les nœuds non élagués ne sont pas concernés : ils n'exécutent jamais le proxy.

L'action « Télécharger l'instantané UTXO (assumeutxo) » a également été réparée. Chaque tentative échouait dès son lancement en signalant un fichier introuvable sans rapport avec l'adresse saisie : le programme que l'action utilisait pour récupérer l'instantané n'était plus livré avec le service. Les téléchargements démarrent désormais comme prévu, et une URL qui répond par une page d'erreur est signalée comme un téléchargement échoué au lieu d'être enregistrée comme s'il s'agissait d'un instantané. L'action est aussi plus robuste autour : un téléchargement qui n'avance plus est abandonné au lieu de laisser l'action bloquée sur « Téléchargement en cours », un échec indique désormais ce qui a mal tourné et non plus seulement qu'il a échoué, et le fichier d'instantané — environ 11 Go — est supprimé une fois que Bitcoin l'a absorbé.

Par ailleurs, trois renforcements issus d'un audit de sécurité communautaire.

La vérification des signatures d'une version amont compte désormais des signataires distincts plutôt que des signatures. Comme elle comptait les signatures, une seule clé de publication signant plusieurs fois pouvait satisfaire un quorum censé exiger plusieurs personnes indépendantes : la tolérance annoncée par la vérification n'était donc pas celle qu'elle appliquait. Rien ne change pour les versions que ce paquet construit : chacune est signée par bien plus de personnes distinctes qu'il n'en faut pour passer dans les deux cas.

Lorsqu'un autre service demande à modifier la configuration de ce nœud, il n'atteint plus que la poignée de réglages qui le concernent réellement, au lieu de l'ensemble du fichier de configuration. Auparavant, une telle demande pouvait aussi porter des réglages qui n'apparaissaient jamais sur l'écran où vous la validez.

Enfin, un mot de passe RPC fourni par un autre service doit désormais compter au moins vingt caractères. Ce champ est rempli par le service qui demande l'accès et vous ne pouvez pas le modifier : rien n'empêchait donc un service négligent de choisir quelque chose de facile à deviner.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
