import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:17',
  releaseNotes: {
    en_US: `- Frees the peer port that the StartOS 0.3.5 version of Bitcoin left claimed. If that version had a Tor address on the Peer interface, Bitcoin moves it to the current peer port, keeping the same .onion address, as soon as a version of Tor that allows it is installed.
- Delete Peer List asks for confirmation before running.
- A service that needs Bitcoin's wallet can turn it on from its setup task.`,
    es_ES: `- Libera el puerto de pares que la versión de Bitcoin para StartOS 0.3.5 dejó reservado. Si esa versión tenía una dirección Tor en la interfaz Peer, Bitcoin la traslada al puerto de pares actual, conservando la misma dirección .onion, en cuanto se instala una versión de Tor que lo permita.
- Eliminar lista de pares pide confirmación antes de ejecutarse.
- Un servicio que necesita el monedero de Bitcoin puede activarlo desde su tarea de configuración.`,
    de_DE: `- Gibt den Peer-Port frei, den die StartOS-0.3.5-Version von Bitcoin belegt gelassen hatte. Hatte diese Version eine Tor-Adresse an der Peer-Schnittstelle, verlegt Bitcoin sie auf den aktuellen Peer-Port und behält dieselbe .onion-Adresse, sobald eine Tor-Version installiert ist, die das erlaubt.
- „Peer-Liste löschen“ fragt vor der Ausführung nach einer Bestätigung.
- Ein Dienst, der die Wallet von Bitcoin braucht, kann sie über seine Einrichtungsaufgabe einschalten.`,
    pl_PL: `- Zwalnia port peerów, który pozostawiła zajęty wersja Bitcoina dla StartOS 0.3.5. Jeśli ta wersja miała adres Tor w interfejsie Peer, Bitcoin przenosi go na obecny port peerów, zachowując ten sam adres .onion, gdy tylko zostanie zainstalowana wersja Tora, która na to pozwala.
- „Usuń listę peerów” prosi o potwierdzenie przed uruchomieniem.
- Usługa, która potrzebuje portfela Bitcoina, może go włączyć przez swoje zadanie konfiguracji.`,
    fr_FR: `- Libère le port des pairs que la version de Bitcoin pour StartOS 0.3.5 avait laissé réservé. Si cette version avait une adresse Tor sur l'interface Peer, Bitcoin la déplace vers le port des pairs actuel, en conservant la même adresse .onion, dès qu'une version de Tor qui le permet est installée.
- Supprimer la liste des pairs demande une confirmation avant de s'exécuter.
- Un service qui a besoin du portefeuille de Bitcoin peut l'activer depuis sa tâche de configuration.`,
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
  .satisfies('29.4:16')
  .satisfies('28.4:29')
