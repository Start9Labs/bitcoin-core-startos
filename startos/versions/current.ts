import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:13',
  releaseNotes: {
    en_US: `- Services that index the chain, such as Electrum servers, can now retrieve full transaction details from a pruned node.
- Blocks fetched from the network for another service are kept in memory, up to 64 MiB, so a repeat request is answered without going back out.`,
    es_ES: `- Los servicios que indexan la cadena, como los servidores Electrum, ya pueden obtener los detalles completos de una transacción desde un nodo podado.
- Los bloques obtenidos de la red para otro servicio se mantienen en memoria, hasta 64 MiB, de modo que una petición repetida se responde sin volver a salir.`,
    de_DE: `- Dienste, die die Chain indizieren, etwa Electrum-Server, können jetzt vollständige Transaktionsdetails von einem beschnittenen Knoten abrufen.
- Blöcke, die für einen anderen Dienst aus dem Netzwerk geholt wurden, bleiben im Speicher, bis zu 64 MiB, sodass eine erneute Anfrage ohne neuen Netzwerkzugriff beantwortet wird.`,
    pl_PL: `- Usługi indeksujące łańcuch, takie jak serwery Electrum, mogą teraz pobrać pełne szczegóły transakcji z przyciętego węzła.
- Bloki pobrane z sieci na potrzeby innej usługi są przechowywane w pamięci, do 64 MiB, więc powtórne żądanie jest obsługiwane bez ponownego wyjścia do sieci.`,
    fr_FR: `- Les services qui indexent la chaîne, tels que les serveurs Electrum, peuvent désormais récupérer les détails complets d'une transaction depuis un nœud élagué.
- Les blocs récupérés sur le réseau pour un autre service sont conservés en mémoire, jusqu'à 64 Mio, de sorte qu'une requête répétée est satisfaite sans nouvel accès au réseau.`,
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
  .satisfies('30.3:13')
  .satisfies('29.4:13')
  .satisfies('28.4:26')
