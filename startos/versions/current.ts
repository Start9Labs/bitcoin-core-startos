import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.4:0',
  releaseNotes: {
    en_US: `Updated Bitcoin Core to 29.4.

- Fixes an issue where the chainstate database repeatedly rewrote large portions of itself, causing excessive disk reads and writes during normal operation.
- Corrects the lifetime of precomputed transaction data during validation.
- Improves wallet input size estimation, making fee calculation more accurate.
- Includes updated translations.

Full release notes: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md

Adds chain-split recovery for the BIP-110 (RDTS) era: switching flavors now automatically clears invalid-block verdicts inherited from the RDTS-enforcing flavor, and a new Chain Recovery action group (Reconsider Invalid Blocks) gives manual control.`,
    es_ES: `Actualiza Bitcoin Core a 29.4.

- Corrige un problema por el cual la base de datos del chainstate reescribía repetidamente grandes partes de sí misma, provocando lecturas y escrituras de disco excesivas durante el funcionamiento normal.
- Corrige el tiempo de vida de los datos precalculados de las transacciones durante la validación.
- Mejora la estimación del tamaño de las entradas del monedero, haciendo más precisos los cálculos de comisiones.
- Incluye traducciones actualizadas.

Notas de la versión completas: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md

Añade recuperación ante divisiones de cadena para la era BIP-110 (RDTS): cambiar de variante ahora borra automáticamente los veredictos de bloques inválidos heredados de la variante que aplica RDTS, y un nuevo grupo de acciones Recuperación de cadena (Reconsiderar bloques inválidos) ofrece control manual.`,
    de_DE: `Aktualisiert Bitcoin Core auf 29.4.

- Behebt ein Problem, bei dem die Chainstate-Datenbank wiederholt große Teile von sich selbst neu schrieb und dadurch im normalen Betrieb übermäßige Lese- und Schreibvorgänge auf der Festplatte verursachte.
- Korrigiert die Lebensdauer der vorberechneten Transaktionsdaten während der Validierung.
- Verbessert die Schätzung der Eingabegröße in der Wallet und macht die Gebührenberechnung dadurch genauer.
- Enthält aktualisierte Übersetzungen.

Vollständige Versionshinweise: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md

Fügt Chain-Split-Wiederherstellung für die BIP-110-(RDTS-)Ära hinzu: Ein Variantenwechsel löscht jetzt automatisch von der RDTS-durchsetzenden Variante geerbte Ungültigkeits-Urteile, und eine neue Aktionsgruppe Chain-Wiederherstellung (Ungültige Blöcke überdenken) bietet manuelle Kontrolle.`,
    pl_PL: `Aktualizuje Bitcoin Core do 29.4.

- Naprawia problem, w którym baza danych chainstate wielokrotnie zapisywała od nowa duże swoje fragmenty, powodując nadmierny odczyt i zapis dysku podczas normalnej pracy.
- Poprawia czas życia wstępnie obliczonych danych transakcji podczas walidacji.
- Ulepsza szacowanie rozmiaru wejść w portfelu, dzięki czemu obliczanie opłat jest dokładniejsze.
- Zawiera zaktualizowane tłumaczenia.

Pełne informacje o wydaniu: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md

Dodaje odzyskiwanie po podziale łańcucha na erę BIP-110 (RDTS): zmiana wariantu automatycznie czyści teraz werdykty nieważności bloków odziedziczone po wariancie egzekwującym RDTS, a nowa grupa akcji Odzyskiwanie łańcucha (Rozważ ponownie nieważne bloki) daje ręczną kontrolę.`,
    fr_FR: `Met à jour Bitcoin Core vers 29.4.

- Corrige un problème où la base de données chainstate réécrivait de façon répétée de grandes parties d'elle-même, provoquant des lectures et écritures disque excessives en fonctionnement normal.
- Corrige la durée de vie des données de transaction précalculées lors de la validation.
- Améliore l'estimation de la taille des entrées du portefeuille, rendant le calcul des frais plus précis.
- Inclut des traductions mises à jour.

Notes de version complètes : https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-29.4.md

Ajoute la récupération après scission de chaîne pour l'ère BIP-110 (RDTS) : changer de variante efface désormais automatiquement les verdicts de blocs invalides hérités de la variante appliquant RDTS, et un nouveau groupe d'actions Récupération de chaîne (Reconsidérer les blocs invalides) offre un contrôle manuel.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
}).satisfies('28.4:13')
