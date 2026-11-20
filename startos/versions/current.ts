import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '32.1:1',
  releaseNotes: {
    en_US: `Updated Bitcoin to 32.1. The default maximum number of connections rises from 125 to 200, and transaction-relaying peers may take at most half of the inbound slots. Configured connection limits below 53 are raised to 53 to keep local services connected. A rebuilt transaction index uses less than half the disk space; run Delete Transaction Index to rebuild it, which can take a few hours.

Download UTXO Snapshot now accepts only https URLs, stops a download that grows past the largest valid snapshot, and starts only when 11 GiB of disk space is free. The RPC proxy is updated to 0.8.4: it pauses briefly before refusing a wrong password, and no longer names itself to Bitcoin peers.`,
    es_ES: `Bitcoin actualizado a 32.1. El número máximo de conexiones predeterminado sube de 125 a 200, y los pares que retransmiten transacciones pueden ocupar como máximo la mitad de las ranuras entrantes. Los límites de conexiones configurados por debajo de 53 se elevan a 53 para mantener conectados los servicios locales. Un índice de transacciones reconstruido ocupa menos de la mitad del espacio en disco; ejecute Eliminar índice de transacciones para reconstruirlo, lo que puede tardar unas horas.

Descargar instantánea UTXO ahora solo acepta URL https, detiene una descarga que supera el tamaño de la mayor instantánea válida y solo comienza cuando hay 11 GiB de espacio libre en disco. El proxy RPC se actualiza a 0.8.4: hace una breve pausa antes de rechazar una contraseña incorrecta y ya no se identifica por su nombre ante los pares de Bitcoin.`,
    de_DE: `Bitcoin auf 32.1 aktualisiert. Die Standardanzahl maximaler Verbindungen steigt von 125 auf 200, und Peers, die Transaktionen weiterleiten, dürfen höchstens die Hälfte der eingehenden Plätze belegen. Konfigurierte Verbindungslimits unter 53 werden auf 53 angehoben, damit lokale Dienste verbunden bleiben. Ein neu aufgebauter Transaktionsindex belegt weniger als die Hälfte des Speicherplatzes; führen Sie „Transaktionsindex löschen“ aus, um ihn neu aufzubauen, was einige Stunden dauern kann.

UTXO-Snapshot herunterladen akzeptiert jetzt nur noch https-URLs, bricht einen Download ab, der größer als der größte gültige Snapshot wird, und startet nur, wenn 11 GiB Speicherplatz frei sind. Der RPC-Proxy wird auf 0.8.4 aktualisiert: Er wartet kurz, bevor er ein falsches Passwort ablehnt, und nennt Bitcoin-Peers nicht mehr seinen Namen.`,
    pl_PL: `Zaktualizowano Bitcoin do wersji 32.1. Domyślna maksymalna liczba połączeń wzrasta ze 125 do 200, a peery przekazujące transakcje mogą zająć co najwyżej połowę slotów przychodzących. Skonfigurowane limity połączeń poniżej 53 są podnoszone do 53, aby usługi lokalne mogły się łączyć. Odbudowany indeks transakcji zajmuje mniej niż połowę miejsca na dysku; uruchom Usuń indeks transakcji, aby go odbudować, co może potrwać kilka godzin.

Pobierz migawkę UTXO akceptuje teraz tylko adresy URL https, przerywa pobieranie, które przekracza rozmiar największej prawidłowej migawki, i rozpoczyna się tylko wtedy, gdy na dysku jest 11 GiB wolnego miejsca. Proxy RPC zostaje zaktualizowane do wersji 0.8.4: przed odrzuceniem błędnego hasła robi krótką pauzę i nie przedstawia się już z nazwy peerom Bitcoina.`,
    fr_FR: `Bitcoin mis à jour vers 32.1. Le nombre maximal de connexions par défaut passe de 125 à 200, et les pairs qui relaient des transactions peuvent occuper au plus la moitié des emplacements entrants. Les limites de connexions configurées en dessous de 53 sont portées à 53 pour permettre aux services locaux de se connecter. Un index des transactions reconstruit occupe moins de la moitié de l'espace disque ; exécutez Supprimer l'index des transactions pour le reconstruire, ce qui peut prendre quelques heures.

Télécharger l'instantané UTXO n'accepte désormais que les URL https, interrompt un téléchargement qui dépasse la taille du plus grand instantané valide et ne démarre que lorsque 11 Gio d'espace disque sont libres. Le proxy RPC passe à la version 0.8.4 : il marque une courte pause avant de refuser un mot de passe erroné et ne se nomme plus auprès des pairs Bitcoin.`,
  },
  migrations: {
    up: IMPOSSIBLE,
    down: async () => {},
    // Any line's install that has run its own copies of every migration updates here directly.
    other: {
      '=32.1:0': { up: async () => {} },
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
