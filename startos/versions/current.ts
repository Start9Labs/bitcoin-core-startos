import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { peerHostId } from '../utils'

export const current = VersionInfo.of({
  version: '31.1:18',
  releaseNotes: {
    en_US:
      'Frees the peer port that the StartOS 0.3.5 version of Bitcoin left claimed. If that version had a Tor address on the Peer interface, Bitcoin moves it to the current peer port, keeping the same .onion address, as soon as a version of Tor that allows it is installed.',
    es_ES:
      'Libera el puerto de pares que la versión de Bitcoin para StartOS 0.3.5 dejó reservado. Si esa versión tenía una dirección Tor en la interfaz Peer, Bitcoin la traslada al puerto de pares actual, conservando la misma dirección .onion, en cuanto se instala una versión de Tor que lo permita.',
    de_DE:
      'Gibt den Peer-Port frei, den die StartOS-0.3.5-Version von Bitcoin belegt gelassen hatte. Hatte diese Version eine Tor-Adresse an der Peer-Schnittstelle, verlegt Bitcoin sie auf den aktuellen Peer-Port und behält dieselbe .onion-Adresse, sobald eine Tor-Version installiert ist, die das erlaubt.',
    pl_PL:
      'Zwalnia port peerów, który pozostawiła zajęty wersja Bitcoina dla StartOS 0.3.5. Jeśli ta wersja miała adres Tor w interfejsie Peer, Bitcoin przenosi go na obecny port peerów, zachowując ten sam adres .onion, gdy tylko zostanie zainstalowana wersja Tora, która na to pozwala.',
    fr_FR:
      "Libère le port des pairs que la version de Bitcoin pour StartOS 0.3.5 avait laissé réservé. Si cette version avait une adresse Tor sur l'interface Peer, Bitcoin la déplace vers le port des pairs actuel, en conservant la même adresse .onion, dès qu'une version de Tor qui le permet est installée.",
  },
  migrations: {
    up: async ({ effects }) => {
      // The StartOS 0.3.5 package bound container port 8333 on the peer host,
      // left disabled but holding external 8333 once 58333 replaced it. Tor
      // keeps the peer .onion as unused; reattachPeerOnions moves it to 58333.
      if (await sdk.MultiHost.of(effects, peerHostId).retirePort(8333)) {
        await storeJson.merge(effects, { reattachPeerOnions: true })
      }
    },
    down: async ({ effects }) => {
      // v31 changed CURRENT_FEES_FILE_VERSION (149900 → 309900) and the
      // fee estimator bucket size; ≤30 hard-fails on a v31-written file.
      await rm('/media/startos/volumes/main/fee_estimates.dat', {
        force: true,
      }).catch(console.error)
    },
  },
})
  .satisfies('30.3:16')
  .satisfies('29.4:16')
  .satisfies('28.4:29')
