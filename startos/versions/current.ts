import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:20',
  releaseNotes: {
    en_US:
      'Restarting Bitcoin Core while it is still starting stops every process of the previous run.',
    es_ES:
      'Reiniciar Bitcoin Core mientras aún se está iniciando detiene todos los procesos de la ejecución anterior.',
    de_DE:
      'Ein Neustart von Bitcoin Core, während es noch startet, beendet alle Prozesse des vorherigen Laufs.',
    pl_PL:
      'Ponowne uruchomienie Bitcoin Core w trakcie uruchamiania zatrzymuje wszystkie procesy poprzedniego uruchomienia.',
    fr_FR:
      "Redémarrer Bitcoin Core pendant son démarrage arrête tous les processus de l'exécution précédente.",
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
