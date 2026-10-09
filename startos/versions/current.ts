import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:18',
  releaseNotes: {
    en_US:
      "Fixes Bitcoin failing to update or start on servers moved from StartOS 0.3.5 that don't have Tor installed.",
    es_ES:
      'Corrige que Bitcoin no pudiera actualizarse ni arrancar en servidores trasladados desde StartOS 0.3.5 que no tienen Tor instalado.',
    de_DE:
      'Behebt, dass Bitcoin auf Servern, die von StartOS 0.3.5 umgezogen sind und Tor nicht installiert haben, weder aktualisieren noch starten konnte.',
    pl_PL:
      'Naprawia błąd, przez który Bitcoin nie mógł się zaktualizować ani uruchomić na serwerach przeniesionych ze StartOS 0.3.5 bez zainstalowanego Tora.',
    fr_FR:
      "Corrige l'impossibilité pour Bitcoin de se mettre à jour ou de démarrer sur les serveurs migrés depuis StartOS 0.3.5 sur lesquels Tor n'est pas installé.",
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
