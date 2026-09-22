import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { sdk } from '../sdk'
import { peerHostId } from '../utils'

export const current = VersionInfo.of({
  version: '31.1:18',
  releaseNotes: {
    en_US:
      'Frees the peer port left claimed by the StartOS 0.3.5 version of Bitcoin. If that version had a Tor address on the Peer interface, the address is kept: add it back from the Peer interface with Add Onion Service, where it is offered for reuse.',
    es_ES:
      'Libera el puerto de pares que la versión de Bitcoin para StartOS 0.3.5 dejó reservado. Si esa versión tenía una dirección Tor en la interfaz Peer, la dirección se conserva: vuelva a añadirla desde la interfaz Peer con Add Onion Service, donde se ofrece para reutilizarla.',
    de_DE:
      'Gibt den Peer-Port frei, den die StartOS-0.3.5-Version von Bitcoin belegt gelassen hatte. Hatte diese Version eine Tor-Adresse an der Peer-Schnittstelle, bleibt die Adresse erhalten: Fügen Sie sie über die Peer-Schnittstelle mit Add Onion Service wieder hinzu, wo sie zur Wiederverwendung angeboten wird.',
    pl_PL:
      'Zwalnia port peerów, który pozostawiła zajęty wersja Bitcoina dla StartOS 0.3.5. Jeśli ta wersja miała adres Tor w interfejsie Peer, adres zostaje zachowany: dodaj go ponownie z interfejsu Peer za pomocą Add Onion Service, gdzie jest oferowany do ponownego użycia.',
    fr_FR:
      "Libère le port des pairs que la version de Bitcoin pour StartOS 0.3.5 avait laissé réservé. Si cette version avait une adresse Tor sur l'interface Peer, l'adresse est conservée : rajoutez-la depuis l'interface Peer avec Add Onion Service, où elle est proposée pour être réutilisée.",
  },
  migrations: {
    up: async ({ effects }) => {
      await sdk.MultiHost.of(effects, peerHostId).retirePort(8333)
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
