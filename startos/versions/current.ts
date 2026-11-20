import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '30.5:0',
  releaseNotes: {
    en_US: `Updated Bitcoin Core to 30.5, a maintenance release: a node no longer handles repeated announcements of the same transaction twice, saving some work. Full release notes: https://github.com/bitcoin/bitcoin/blob/v30.5/doc/release-notes.md

Download UTXO Snapshot now accepts only https URLs, stops a download that grows past the largest valid snapshot, and starts only when 11 GiB of disk space is free. The RPC proxy is updated to 0.8.4: it pauses briefly before refusing a wrong password, and no longer names itself to Bitcoin peers.`,
    es_ES: `Bitcoin Core actualizado a 30.5, una versión de mantenimiento: el nodo ya no procesa dos veces los anuncios repetidos de la misma transacción, lo que ahorra algo de trabajo. Notas completas: https://github.com/bitcoin/bitcoin/blob/v30.5/doc/release-notes.md

Descargar instantánea UTXO ahora solo acepta URL https, detiene una descarga que supera el tamaño de la mayor instantánea válida y solo comienza cuando hay 11 GiB de espacio libre en disco. El proxy RPC se actualiza a 0.8.4: hace una breve pausa antes de rechazar una contraseña incorrecta y ya no se identifica por su nombre ante los pares de Bitcoin.`,
    de_DE: `Bitcoin Core auf 30.5 aktualisiert, eine Wartungsversion: Der Knoten verarbeitet wiederholte Ankündigungen derselben Transaktion nicht mehr doppelt und spart so etwas Arbeit. Vollständige Versionshinweise: https://github.com/bitcoin/bitcoin/blob/v30.5/doc/release-notes.md

UTXO-Snapshot herunterladen akzeptiert jetzt nur noch https-URLs, bricht einen Download ab, der größer als der größte gültige Snapshot wird, und startet nur, wenn 11 GiB Speicherplatz frei sind. Der RPC-Proxy wird auf 0.8.4 aktualisiert: Er wartet kurz, bevor er ein falsches Passwort ablehnt, und nennt Bitcoin-Peers nicht mehr seinen Namen.`,
    pl_PL: `Zaktualizowano Bitcoin Core do 30.5, wydania serwisowego: węzeł nie przetwarza już dwukrotnie powtórzonych ogłoszeń tej samej transakcji, co oszczędza nieco pracy. Pełne informacje o wydaniu: https://github.com/bitcoin/bitcoin/blob/v30.5/doc/release-notes.md

Pobierz migawkę UTXO akceptuje teraz tylko adresy URL https, przerywa pobieranie, które przekracza rozmiar największej prawidłowej migawki, i rozpoczyna się tylko wtedy, gdy na dysku jest 11 GiB wolnego miejsca. Proxy RPC zostaje zaktualizowane do wersji 0.8.4: przed odrzuceniem błędnego hasła robi krótką pauzę i nie przedstawia się już z nazwy peerom Bitcoina.`,
    fr_FR: `Bitcoin Core mis à jour vers 30.5, une version de maintenance : le nœud ne traite plus deux fois les annonces répétées d'une même transaction, ce qui lui épargne du travail. Notes de version complètes : https://github.com/bitcoin/bitcoin/blob/v30.5/doc/release-notes.md

Télécharger l'instantané UTXO n'accepte désormais que les URL https, interrompt un téléchargement qui dépasse la taille du plus grand instantané valide et ne démarre que lorsque 11 Gio d'espace disque sont libres. Le proxy RPC passe à la version 0.8.4 : il marque une courte pause avant de refuser un mot de passe erroné et ne se nomme plus auprès des pairs Bitcoin.`,
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
  .satisfies('29.5:4')
  .satisfies('28.4:42')
