import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.4:13',
  releaseNotes: {
    en_US: `- Blocks fetched from the network for another service are kept in memory, up to 64 MiB, so a repeat request is answered without going back out.`,
    es_ES: `- Los bloques obtenidos de la red para otro servicio se mantienen en memoria, hasta 64 MiB, de modo que una petición repetida se responde sin volver a salir.`,
    de_DE: `- Blöcke, die für einen anderen Dienst aus dem Netzwerk geholt wurden, bleiben im Speicher, bis zu 64 MiB, sodass eine erneute Anfrage ohne neuen Netzwerkzugriff beantwortet wird.`,
    pl_PL: `- Bloki pobrane z sieci na potrzeby innej usługi są przechowywane w pamięci, do 64 MiB, więc powtórne żądanie jest obsługiwane bez ponownego wyjścia do sieci.`,
    fr_FR: `- Les blocs récupérés sur le réseau pour un autre service sont conservés en mémoire, jusqu'à 64 Mio, de sorte qu'une requête répétée est satisfaite sans nouvel accès au réseau.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
}).satisfies('28.4:26')
