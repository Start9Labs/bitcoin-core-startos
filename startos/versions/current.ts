import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:34',
  releaseNotes: {
    en_US:
      'A Peers health check shows how many outbound and inbound peers the node is connected to.',
    es_ES:
      'Una comprobación de estado de Pares muestra a cuántos pares salientes y entrantes está conectado el nodo.',
    de_DE:
      'Eine Peers-Zustandsprüfung zeigt, mit wie vielen ausgehenden und eingehenden Peers der Knoten verbunden ist.',
    pl_PL:
      'Kontrola stanu Węzły pokazuje, z iloma węzłami wychodzącymi i przychodzącymi połączony jest węzeł.',
    fr_FR:
      "Une vérification d'état Pairs indique à combien de pairs sortants et entrants le nœud est connecté.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
