import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:23',
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
