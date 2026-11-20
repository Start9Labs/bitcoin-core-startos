import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:44',
  releaseNotes: {
    en_US:
      'Download UTXO Snapshot now accepts only https URLs, stops a download that grows past the largest valid snapshot, and starts only when 10 GiB of disk space is free. The RPC proxy is updated to 0.8.4: it pauses briefly before refusing a wrong password, and no longer names itself to Bitcoin peers.',
    es_ES:
      'Descargar instantánea UTXO ahora solo acepta URL https, detiene una descarga que supera el tamaño de la mayor instantánea válida y solo comienza cuando hay 10 GiB de espacio libre en disco. El proxy RPC se actualiza a 0.8.4: hace una breve pausa antes de rechazar una contraseña incorrecta y ya no se identifica por su nombre ante los pares de Bitcoin.',
    de_DE:
      'UTXO-Snapshot herunterladen akzeptiert jetzt nur noch https-URLs, bricht einen Download ab, der größer als der größte gültige Snapshot wird, und startet nur, wenn 10 GiB Speicherplatz frei sind. Der RPC-Proxy wird auf 0.8.4 aktualisiert: Er wartet kurz, bevor er ein falsches Passwort ablehnt, und nennt Bitcoin-Peers nicht mehr seinen Namen.',
    pl_PL:
      'Pobierz migawkę UTXO akceptuje teraz tylko adresy URL https, przerywa pobieranie, które przekracza rozmiar największej prawidłowej migawki, i rozpoczyna się tylko wtedy, gdy na dysku jest 10 GiB wolnego miejsca. Proxy RPC zostaje zaktualizowane do wersji 0.8.4: przed odrzuceniem błędnego hasła robi krótką pauzę i nie przedstawia się już z nazwy peerom Bitcoina.',
    fr_FR:
      "Télécharger l'instantané UTXO n'accepte désormais que les URL https, interrompt un téléchargement qui dépasse la taille du plus grand instantané valide et ne démarre que lorsque 10 Gio d'espace disque sont libres. Le proxy RPC passe à la version 0.8.4 : il marque une courte pause avant de refuser un mot de passe erroné et ne se nomme plus auprès des pairs Bitcoin.",
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
