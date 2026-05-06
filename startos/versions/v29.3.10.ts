import { VersionInfo } from '@start9labs/start-sdk'

export const v_29_3_10 = VersionInfo.of({
  version: '29.3:10',
  releaseNotes: {
    en_US: 'Switched to upstream Guix-built binaries with 5-of-7 multi-builder PGP verification. Faster builds. Removed dead IPC plumbing (feature was never functional on this branch). Downgrades to a prior major version are now supported.',
    es_ES: 'Cambio a binarios Guix oficiales con verificación PGP de 5 de 7 firmantes. Compilaciones más rápidas. Se ha eliminado el código IPC inactivo (la función nunca estuvo operativa en esta rama). Ahora se admiten degradaciones a una versión principal anterior.',
    de_DE: 'Wechsel zu offiziellen Guix-Binärdateien mit 5-von-7-Multi-Builder-PGP-Verifikation. Schnellere Builds. Toter IPC-Code entfernt (Feature war auf diesem Branch nie funktionsfähig). Downgrades auf eine frühere Hauptversion werden nun unterstützt.',
    pl_PL: 'Przejście na binaria Guix od projektu z weryfikacją PGP 5 z 7 sygnatariuszy. Szybsze kompilacje. Usunięto martwy kod IPC (funkcja nigdy nie działała na tej gałęzi). Obniżenie do wcześniejszej wersji głównej jest teraz obsługiwane.',
    fr_FR: 'Passage aux binaires Guix officiels avec vérification PGP multi-builder 5 sur 7. Compilations plus rapides. Suppression du code IPC inactif (la fonctionnalité n’a jamais été opérationnelle sur cette branche). La rétrogradation vers une version majeure antérieure est désormais prise en charge.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
