import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const v_30_2_10 = VersionInfo.of({
  version: '30.2:10',
  releaseNotes: {
    en_US: 'Switched to upstream Guix-built binaries with 5-of-7 multi-builder PGP verification. Faster builds. Removed the experimental IPC feature; users who need IPC should upgrade to v31. Downgrades to a prior major version are now supported.',
    es_ES: 'Cambio a binarios Guix oficiales con verificación PGP de 5 de 7 firmantes. Compilaciones más rápidas. Se ha eliminado la función experimental de IPC; los usuarios que necesiten IPC deben actualizar a v31. Ahora se admiten degradaciones a una versión principal anterior.',
    de_DE: 'Wechsel zu offiziellen Guix-Binärdateien mit 5-von-7-Multi-Builder-PGP-Verifikation. Schnellere Builds. Die experimentelle IPC-Funktion wurde entfernt; Nutzer, die IPC benötigen, sollten auf v31 aktualisieren. Downgrades auf eine frühere Hauptversion werden nun unterstützt.',
    pl_PL: 'Przejście na binaria Guix od projektu z weryfikacją PGP 5 z 7 sygnatariuszy. Szybsze kompilacje. Usunięto eksperymentalną funkcję IPC; użytkownicy potrzebujący IPC powinni zaktualizować do v31. Obniżenie do wcześniejszej wersji głównej jest teraz obsługiwane.',
    fr_FR: 'Passage aux binaires Guix officiels avec vérification PGP multi-builder 5 sur 7. Compilations plus rapides. Suppression de la fonctionnalité IPC expérimentale ; les utilisateurs ayant besoin d’IPC doivent passer à v31. La rétrogradation vers une version majeure antérieure est désormais prise en charge.',
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
