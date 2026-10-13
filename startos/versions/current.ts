import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:21',
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
