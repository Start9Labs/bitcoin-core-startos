import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const v_31_0_10 = VersionInfo.of({
  version: '31.0:10',
  releaseNotes: {
    en_US: 'Switched to upstream Guix-built binaries with 5-of-7 multi-builder PGP verification. Faster builds. Downgrades to a prior major version are now supported.',
    es_ES: 'Cambio a binarios Guix oficiales con verificación PGP de 5 de 7 firmantes. Compilaciones más rápidas. Ahora se admiten degradaciones a una versión principal anterior.',
    de_DE: 'Wechsel zu offiziellen Guix-Binärdateien mit 5-von-7-Multi-Builder-PGP-Verifikation. Schnellere Builds. Downgrades auf eine frühere Hauptversion werden nun unterstützt.',
    pl_PL: 'Przejście na binaria Guix od projektu z weryfikacją PGP 5 z 7 sygnatariuszy. Szybsze kompilacje. Obniżenie do wcześniejszej wersji głównej jest teraz obsługiwane.',
    fr_FR: 'Passage aux binaires Guix officiels avec vérification PGP multi-builder 5 sur 7. Compilations plus rapides. La rétrogradation vers une version majeure antérieure est désormais prise en charge.',
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
