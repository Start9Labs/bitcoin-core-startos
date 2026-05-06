import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_28_3_10 = VersionInfo.of({
  version: '28.3:10',
  releaseNotes: {
    en_US:
      'Switched to upstream Guix-built binaries with 5-of-7 multi-builder PGP verification. Faster builds. Removed dead IPC plumbing (feature was never functional on this branch).',
    es_ES:
      'Cambio a binarios Guix oficiales con verificación PGP de 5 de 7 firmantes. Compilaciones más rápidas. Se ha eliminado el código IPC inactivo (la función nunca estuvo operativa en esta rama).',
    de_DE:
      'Wechsel zu offiziellen Guix-Binärdateien mit 5-von-7-Multi-Builder-PGP-Verifikation. Schnellere Builds. Toter IPC-Code entfernt (Feature war auf diesem Branch nie funktionsfähig).',
    pl_PL:
      'Przejście na binaria Guix od projektu z weryfikacją PGP 5 z 7 sygnatariuszy. Szybsze kompilacje. Usunięto martwy kod IPC (funkcja nigdy nie działała na tej gałęzi).',
    fr_FR:
      'Passage aux binaires Guix officiels avec vérification PGP multi-builder 5 sur 7. Compilations plus rapides. Suppression du code IPC inactif (la fonctionnalité n’a jamais été opérationnelle sur cette branche).',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
