import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:4',
  releaseNotes: {
    en_US: `Gives local services a dedicated, trusted connection for downloading blocks.

Services on this server that pull blocks from Bitcoin Core over the peer protocol — Electrs, for instance — were connecting on the same port as anonymous peers from the internet, and were treated with the same suspicion: liable to be dropped to make room for another peer, and subject to the limits that protect your upload bandwidth. They now connect on a separate, local-only port that Bitcoin Core trusts, so a busy wallet query can no longer get them disconnected. Connections from the internet are unaffected and still arrive on the public port.`,
    es_ES: `Ofrece a los servicios locales una conexión dedicada y de confianza para descargar bloques.

Los servicios de este servidor que obtienen bloques de Bitcoin Core mediante el protocolo entre pares —Electrs, por ejemplo— se conectaban por el mismo puerto que los pares anónimos de internet y recibían el mismo trato receloso: podían ser desconectados para dejar sitio a otro par y estaban sujetos a los límites que protegen tu ancho de banda de subida. Ahora se conectan por un puerto aparte, solo local, en el que Bitcoin Core confía, de modo que una consulta intensa de una cartera ya no puede provocar su desconexión. Las conexiones desde internet no cambian y siguen llegando al puerto público.`,
    de_DE: `Gibt lokalen Diensten eine eigene, vertrauenswürdige Verbindung zum Herunterladen von Blöcken.

Dienste auf diesem Server, die Blöcke über das Peer-Protokoll von Bitcoin Core beziehen — etwa Electrs —, verbanden sich über denselben Port wie anonyme Gegenstellen aus dem Internet und wurden ebenso misstrauisch behandelt: Sie konnten getrennt werden, um Platz für eine andere Gegenstelle zu schaffen, und unterlagen den Limits, die deine Upload-Bandbreite schützen. Jetzt verbinden sie sich über einen separaten, rein lokalen Port, dem Bitcoin Core vertraut, sodass eine intensive Wallet-Abfrage sie nicht mehr trennen kann. Verbindungen aus dem Internet bleiben unverändert und laufen weiterhin über den öffentlichen Port.`,
    pl_PL: `Daje lokalnym usługom dedykowane, zaufane połączenie do pobierania bloków.

Usługi na tym serwerze, które pobierają bloki z Bitcoin Core przez protokół peer-to-peer — na przykład Electrs — łączyły się tym samym portem co anonimowe węzły z internetu i były traktowane równie nieufnie: mogły zostać rozłączone, by zrobić miejsce innemu węzłowi, i podlegały limitom chroniącym twoje pasmo wysyłania. Teraz łączą się osobnym, wyłącznie lokalnym portem, któremu Bitcoin Core ufa, więc intensywne zapytanie portfela nie może już ich rozłączyć. Połączenia z internetu nie zmieniają się i nadal trafiają na port publiczny.`,
    fr_FR: `Donne aux services locaux une connexion dédiée et de confiance pour télécharger les blocs.

Les services de ce serveur qui récupèrent des blocs auprès de Bitcoin Core via le protocole pair-à-pair — Electrs, par exemple — se connectaient sur le même port que les pairs anonymes d'internet et étaient traités avec la même méfiance : susceptibles d'être déconnectés pour laisser la place à un autre pair, et soumis aux limites qui protègent votre bande passante montante. Ils se connectent désormais sur un port distinct, uniquement local, auquel Bitcoin Core fait confiance, de sorte qu'une requête de portefeuille intensive ne peut plus provoquer leur déconnexion. Les connexions venues d'internet sont inchangées et arrivent toujours sur le port public.`,
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
  .satisfies('29.4:4')
  .satisfies('28.4:17')
