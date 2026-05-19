import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const v_31_0_13 = VersionInfo.of({
  version: '31.0:13',
  releaseNotes: {
    en_US:
      'Fixes a crash loop on startup when a stale IPC socket is present in the data directory.',
    es_ES:
      'Corrige un bucle de reinicio al iniciar cuando hay un socket IPC obsoleto en el directorio de datos.',
    de_DE:
      'Behebt eine Neustart-Schleife beim Start, wenn ein veralteter IPC-Socket im Datenverzeichnis vorhanden ist.',
    pl_PL:
      'Naprawia pętlę restartów przy starcie, gdy w katalogu danych znajduje się nieaktualne gniazdo IPC.',
    fr_FR:
      'Corrige une boucle de redémarrage au démarrage lorsqu\'un socket IPC obsolète est présent dans le répertoire de données.',
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
