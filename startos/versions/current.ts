import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.4:0',
  releaseNotes: {
    en_US: `Updated Bitcoin Core to 29.4.

- Fixes an issue where the chainstate database repeatedly rewrote large portions of itself, causing excessive disk reads and writes during normal operation.
- Corrects the lifetime of precomputed transaction data during validation.
- Improves wallet input size estimation, making fee calculation more accurate.
- Includes updated translations.

Full release notes: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md`,
    es_ES: `Actualiza Bitcoin Core a 29.4.

- Corrige un problema por el cual la base de datos del chainstate reescribía repetidamente grandes partes de sí misma, provocando lecturas y escrituras de disco excesivas durante el funcionamiento normal.
- Corrige el tiempo de vida de los datos precalculados de las transacciones durante la validación.
- Mejora la estimación del tamaño de las entradas del monedero, haciendo más precisos los cálculos de comisiones.
- Incluye traducciones actualizadas.

Notas de la versión completas: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md`,
    de_DE: `Aktualisiert Bitcoin Core auf 29.4.

- Behebt ein Problem, bei dem die Chainstate-Datenbank wiederholt große Teile von sich selbst neu schrieb und dadurch im normalen Betrieb übermäßige Lese- und Schreibvorgänge auf der Festplatte verursachte.
- Korrigiert die Lebensdauer der vorberechneten Transaktionsdaten während der Validierung.
- Verbessert die Schätzung der Eingabegröße in der Wallet und macht die Gebührenberechnung dadurch genauer.
- Enthält aktualisierte Übersetzungen.

Vollständige Versionshinweise: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md`,
    pl_PL: `Aktualizuje Bitcoin Core do 29.4.

- Naprawia problem, w którym baza danych chainstate wielokrotnie zapisywała od nowa duże swoje fragmenty, powodując nadmierny odczyt i zapis dysku podczas normalnej pracy.
- Poprawia czas życia wstępnie obliczonych danych transakcji podczas walidacji.
- Ulepsza szacowanie rozmiaru wejść w portfelu, dzięki czemu obliczanie opłat jest dokładniejsze.
- Zawiera zaktualizowane tłumaczenia.

Pełne informacje o wydaniu: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md`,
    fr_FR: `Met à jour Bitcoin Core vers 29.4.

- Corrige un problème où la base de données chainstate réécrivait de façon répétée de grandes parties d'elle-même, provoquant des lectures et écritures disque excessives en fonctionnement normal.
- Corrige la durée de vie des données de transaction précalculées lors de la validation.
- Améliore l'estimation de la taille des entrées du portefeuille, rendant le calcul des frais plus précis.
- Inclut des traductions mises à jour.

Notes de version complètes : https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
