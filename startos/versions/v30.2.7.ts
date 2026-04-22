import { VersionInfo } from '@start9labs/start-sdk'

export const v_30_2_7 = VersionInfo.of({
  version: '30.2:7',
  releaseNotes: {
    en_US:
      "Config toggles now have a third 'use upstream default' state, and each field's footnote shows the actual Bitcoin Core default. Faster RPC readiness probe (port-listening check instead of a bitcoin-cli subprocess). Removed obsolete 0.3.5-era install migration. SDK and dependency updates.",
    es_ES:
      "Los interruptores de configuración tienen ahora un tercer estado 'usar el valor predeterminado de origen', y cada campo muestra en su nota al pie el valor por defecto real de Bitcoin Core. Comprobación de disponibilidad de RPC más rápida (escucha de puerto en lugar de un subproceso bitcoin-cli). Se eliminó la migración de instalación obsoleta de la era 0.3.5. Actualizaciones del SDK y de dependencias.",
    de_DE:
      "Konfigurations-Schalter haben jetzt einen dritten Zustand 'Standard von Bitcoin Core verwenden', und jede Fußnote zeigt den tatsächlichen Upstream-Standardwert. Schnellere RPC-Bereitschaftsprüfung (Port-Lauschen statt bitcoin-cli-Subprozess). Entfernung der veralteten Installations-Migration aus der 0.3.5-Ära. SDK- und Abhängigkeits-Aktualisierungen.",
    pl_PL:
      'Przełączniki konfiguracji mają teraz trzeci stan „użyj domyślnej wartości z Bitcoin Core", a stopki pól pokazują rzeczywiste wartości domyślne. Szybsza kontrola gotowości RPC (nasłuchiwanie portu zamiast podprocesu bitcoin-cli). Usunięto przestarzałą migrację instalacyjną z wersji 0.3.5. Aktualizacje SDK i zależności.',
    fr_FR:
      "Les bascules de configuration disposent désormais d'un troisième état « utiliser la valeur par défaut amont », et chaque note de bas de page affiche la valeur par défaut réelle de Bitcoin Core. Vérification de disponibilité RPC plus rapide (écoute de port au lieu d'un sous-processus bitcoin-cli). Suppression de la migration d'installation obsolète de l'époque 0.3.5. Mises à jour du SDK et des dépendances.",
  },
  migrations: {
    down: async ({ effects }) => {},
  },
})
