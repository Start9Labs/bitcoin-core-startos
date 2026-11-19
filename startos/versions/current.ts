import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '32.1:0',
  releaseNotes: {
    en_US:
      'Updated Bitcoin to 32.1. The default maximum number of connections rises from 125 to 200, and transaction-relaying peers may take at most half of the inbound slots. Configured connection limits below 53 are raised to 53 to keep local services connected. A rebuilt transaction index uses less than half the disk space; run Delete Transaction Index to rebuild it, which can take a few hours.',
    es_ES:
      'Bitcoin actualizado a 32.1. El número máximo de conexiones predeterminado sube de 125 a 200, y los pares que retransmiten transacciones pueden ocupar como máximo la mitad de las ranuras entrantes. Los límites de conexiones configurados por debajo de 53 se elevan a 53 para mantener conectados los servicios locales. Un índice de transacciones reconstruido ocupa menos de la mitad del espacio en disco; ejecute Eliminar índice de transacciones para reconstruirlo, lo que puede tardar unas horas.',
    de_DE:
      'Bitcoin auf 32.1 aktualisiert. Die Standardanzahl maximaler Verbindungen steigt von 125 auf 200, und Peers, die Transaktionen weiterleiten, dürfen höchstens die Hälfte der eingehenden Plätze belegen. Konfigurierte Verbindungslimits unter 53 werden auf 53 angehoben, damit lokale Dienste verbunden bleiben. Ein neu aufgebauter Transaktionsindex belegt weniger als die Hälfte des Speicherplatzes; führen Sie „Transaktionsindex löschen“ aus, um ihn neu aufzubauen, was einige Stunden dauern kann.',
    pl_PL:
      'Zaktualizowano Bitcoin do wersji 32.1. Domyślna maksymalna liczba połączeń wzrasta ze 125 do 200, a peery przekazujące transakcje mogą zająć co najwyżej połowę slotów przychodzących. Skonfigurowane limity połączeń poniżej 53 są podnoszone do 53, aby usługi lokalne mogły się łączyć. Odbudowany indeks transakcji zajmuje mniej niż połowę miejsca na dysku; uruchom Usuń indeks transakcji, aby go odbudować, co może potrwać kilka godzin.',
    fr_FR:
      "Bitcoin mis à jour vers 32.1. Le nombre maximal de connexions par défaut passe de 125 à 200, et les pairs qui relaient des transactions peuvent occuper au plus la moitié des emplacements entrants. Les limites de connexions configurées en dessous de 53 sont portées à 53 pour permettre aux services locaux de se connecter. Un index des transactions reconstruit occupe moins de la moitié de l'espace disque ; exécutez Supprimer l'index des transactions pour le reconstruire, ce qui peut prendre quelques heures.",
  },
  migrations: {
    up: IMPOSSIBLE,
    down: async () => {},
    // Any line's install that has run its own copies of every migration updates here directly.
    other: {
      '^31.1:27': { up: async () => {} },
      '^30.3:25': { up: async () => {} },
      '^29.4:25': { up: async () => {} },
      '^28.4:38': { up: async () => {} },
    },
  },
})
  .satisfies('31.2:5')
  .satisfies('30.4:4')
  .satisfies('29.5:4')
  .satisfies('28.4:42')
