import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:10',
  releaseNotes: {
    en_US: `Fixes to the connection limit and the sync check.

- Maximum Connections now has a minimum of 40. Bitcoin reserves 11 connection slots for the peers it dials out to, and what is left over is shared between peers on the internet and services on your own server that fetch blocks, such as Electrs. Setting the limit to 11 or fewer left nothing for either, and those services would fail to start, retry, and fail again, with nothing in their own logs pointing back at this setting. A little above 11 was no better: Bitcoin will not drop an internet peer to make room until it is already holding a good number of them, so a tight limit left your own services shut out. The field now stops at 40, and its description says what the setting really controls and points at Max Upload Target and Blocks Only, which are the settings that actually reduce bandwidth. A node already set below 40 is raised to it the next time the package writes the file, which every install, update and restore does.
- Blockchain Sync no longer sits at a syncing percentage on a node that has already caught up. Bitcoin holds its initial-block-download flag for a while after the last block lands; the check now also asks whether any better chain is actually waiting above the blocks your node has validated, and reports finished when none is.`,
    es_ES: `Correcciones en el límite de conexiones y en la comprobación de sincronización.

- Conexiones máximas ahora tiene un mínimo de 40. Bitcoin reserva 11 ranuras de conexión para los pares a los que llama él mismo, y lo que sobra se reparte entre los pares de internet y los servicios de tu propio servidor que obtienen bloques, como Electrs. Fijar el límite en 11 o menos no dejaba nada para ninguno de los dos, y esos servicios no arrancaban, lo reintentaban y volvían a fallar, sin nada en sus propios registros que señalara este ajuste. Un poco por encima de 11 no era mejor: Bitcoin no descarta un par de internet para hacer sitio hasta que ya tiene una buena cantidad de ellos, así que un límite ajustado dejaba fuera a tus propios servicios. El campo ahora no baja de 40, y su descripción dice lo que el ajuste controla en realidad y remite a Objetivo máximo de subida y Solo bloques, que son los ajustes que de verdad reducen el ancho de banda. Un nodo ya fijado por debajo de 40 se sube a ese valor la próxima vez que el paquete escriba el archivo, cosa que hace en cada instalación, actualización y restauración.
- Sincronización de blockchain ya no se queda en un porcentaje de sincronización en un nodo que ya está al día. Bitcoin mantiene su indicador de descarga inicial un tiempo después de que llegue el último bloque; la comprobación ahora también pregunta si hay alguna cadena mejor esperando por encima de los bloques que tu nodo ha validado, e informa de que ha terminado cuando no la hay.`,
    de_DE: `Korrekturen am Verbindungslimit und an der Synchronisationsprüfung.

- Maximale Verbindungen hat jetzt einen Mindestwert von 40. Bitcoin reserviert 11 Verbindungsplätze für die Peers, die es selbst anwählt; was übrig bleibt, teilen sich Peers aus dem Internet und Dienste auf Ihrem eigenen Server, die Blöcke abrufen, etwa Electrs. Ein Wert von 11 oder weniger ließ für beide nichts übrig, und solche Dienste starteten nicht, versuchten es erneut und scheiterten wieder, ohne dass ihre eigenen Protokolle auf diese Einstellung hinwiesen. Etwas über 11 war nicht besser: Bitcoin trennt keinen Internet-Peer, um Platz zu schaffen, solange es nicht ohnehin schon eine ganze Reihe davon hält — ein knappes Limit sperrte die eigenen Dienste also aus. Das Feld beginnt jetzt bei 40, und seine Beschreibung sagt, was die Einstellung wirklich steuert, und verweist auf Maximales Upload-Ziel und Nur Blöcke, die Einstellungen, die tatsächlich Bandbreite sparen. Ein Knoten, der bereits unter 40 steht, wird beim nächsten Schreiben der Datei durch das Paket angehoben — bei jeder Installation, jedem Update und jeder Wiederherstellung.
- Blockchain-Synchronisation bleibt nicht mehr bei einem Fortschrittswert stehen, obwohl der Knoten längst aufgeholt hat. Bitcoin behält sein Kennzeichen für den Erstabgleich noch eine Weile, nachdem der letzte Block eingetroffen ist; die Prüfung fragt jetzt zusätzlich, ob oberhalb der von Ihrem Knoten validierten Blöcke überhaupt eine bessere Kette wartet, und meldet fertig, wenn nicht.`,
    pl_PL: `Poprawki limitu połączeń i kontroli synchronizacji.

- Maksymalna liczba połączeń ma teraz minimum 40. Bitcoin rezerwuje 11 miejsc na połączenia z peerami, do których dzwoni sam, a to, co zostaje, dzielą między siebie peerzy z internetu i usługi na Twoim własnym serwerze, które pobierają bloki, takie jak Electrs. Ustawienie 11 lub mniej nie zostawiało nic dla żadnej ze stron, a takie usługi nie startowały, ponawiały próbę i znów zawodziły, przy czym w ich własnych logach nic nie wskazywało na to ustawienie. Niewiele powyżej 11 nie było lepsze: Bitcoin nie rozłączy peera z internetu, by zrobić miejsce, dopóki nie trzyma ich już sporo, więc ciasny limit zamykał drogę Twoim własnym usługom. Pole zaczyna się teraz od 40, a jego opis mówi, czym to ustawienie naprawdę steruje, i kieruje do ustawień Maksymalny limit wysyłania oraz Tylko bloki, które faktycznie zmniejszają zużycie łącza. Węzeł ustawiony już poniżej 40 zostaje podniesiony do tej wartości przy najbliższym zapisie pliku przez pakiet, co dzieje się przy każdej instalacji, aktualizacji i przywracaniu.
- Synchronizacja blockchainu nie zatrzymuje się już na wartości procentowej, gdy węzeł jest w rzeczywistości na bieżąco. Bitcoin trzyma znacznik pobierania początkowego jeszcze jakiś czas po nadejściu ostatniego bloku; kontrola pyta teraz dodatkowo, czy ponad blokami zweryfikowanymi przez Twój węzeł czeka w ogóle lepszy łańcuch, i zgłasza zakończenie, gdy go nie ma.`,
    fr_FR: `Corrections de la limite de connexions et de la vérification de synchronisation.

- Connexions maximales a désormais un minimum de 40. Bitcoin réserve 11 emplacements de connexion pour les pairs qu'il appelle lui-même, et ce qui reste est partagé entre les pairs d'internet et les services de votre propre serveur qui récupèrent les blocs, comme Electrs. Une valeur de 11 ou moins ne laissait rien ni aux uns ni aux autres, et ces services ne démarraient pas, réessayaient et échouaient de nouveau, sans que leurs propres journaux ne renvoient à ce réglage. Un peu au-dessus de 11 n'était pas mieux : Bitcoin ne coupe pas un pair d'internet pour faire de la place tant qu'il n'en tient pas déjà un bon nombre, de sorte qu'une limite serrée laissait vos propres services dehors. Le champ commence maintenant à 40, et sa description dit ce que le réglage contrôle réellement et renvoie à Objectif maximal d'envoi et Blocs uniquement, les réglages qui réduisent réellement la bande passante. Un nœud déjà réglé en dessous de 40 est remonté à cette valeur à la prochaine écriture du fichier par le paquet, ce que font chaque installation, mise à jour et restauration.
- Synchronisation de la blockchain ne reste plus bloquée sur un pourcentage alors que le nœud a déjà rattrapé son retard. Bitcoin conserve son indicateur de téléchargement initial un moment après l'arrivée du dernier bloc ; la vérification demande maintenant aussi si une meilleure chaîne attend réellement au-dessus des blocs validés par votre nœud, et signale la fin quand ce n'est pas le cas.`,
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
  .satisfies('30.3:8')
  .satisfies('29.4:8')
  .satisfies('28.4:21')
