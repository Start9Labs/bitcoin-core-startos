import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:26',
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
    down: IMPOSSIBLE,
  },
})
