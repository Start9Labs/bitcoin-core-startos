import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:1',
  releaseNotes: {
    en_US: `Updated Bitcoin Core to 30.3.

- Fixes an issue where the chainstate database repeatedly rewrote large portions of itself, causing excessive disk reads and writes during normal operation.
- Fixes several wallet bugs: \`removeprunedfunds\` with conflicting transactions, a crash in fee bumping when the combined bump fee is unavailable, and an amount incorrectly computed as a boolean in coin selection.
- Improves wallet input size estimation and corrects the lifetime of precomputed transaction data during validation.
- Fixes PSBT and Miniscript edge cases, including MuSig2 pubkey validation.
- Includes updated translations.

Full release notes: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-30.3.md

Adds chain-split recovery for the BIP-110 (RDTS) era: switching flavors now automatically clears invalid-block verdicts inherited from the RDTS-enforcing flavor.`,
    es_ES: `Actualiza Bitcoin Core a 30.3.

- Corrige un problema por el cual la base de datos del chainstate reescribía repetidamente grandes partes de sí misma, provocando lecturas y escrituras de disco excesivas durante el funcionamiento normal.
- Corrige varios errores del monedero: \`removeprunedfunds\` con transacciones en conflicto, un fallo al aumentar la comisión cuando la comisión combinada no está disponible, y un importe calculado incorrectamente como booleano en la selección de monedas.
- Mejora la estimación del tamaño de las entradas del monedero y corrige el tiempo de vida de los datos precalculados de las transacciones durante la validación.
- Corrige casos límite en PSBT y Miniscript, incluida la validación de claves públicas MuSig2.
- Incluye traducciones actualizadas.

Notas de la versión completas: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-30.3.md

Añade recuperación ante divisiones de cadena para la era BIP-110 (RDTS): cambiar de variante ahora borra automáticamente los veredictos de bloques inválidos heredados de la variante que aplica RDTS.`,
    de_DE: `Aktualisiert Bitcoin Core auf 30.3.

- Behebt ein Problem, bei dem die Chainstate-Datenbank wiederholt große Teile von sich selbst neu schrieb und dadurch im normalen Betrieb übermäßige Lese- und Schreibvorgänge auf der Festplatte verursachte.
- Behebt mehrere Wallet-Fehler: \`removeprunedfunds\` bei kollidierenden Transaktionen, einen Absturz beim Erhöhen der Gebühr, wenn die kombinierte Erhöhungsgebühr nicht verfügbar ist, und einen in der Münzauswahl fälschlich als Boolean berechneten Betrag.
- Verbessert die Schätzung der Eingabegröße in der Wallet und korrigiert die Lebensdauer der vorberechneten Transaktionsdaten während der Validierung.
- Behebt Grenzfälle in PSBT und Miniscript, einschließlich der Validierung von MuSig2-Public-Keys.
- Enthält aktualisierte Übersetzungen.

Vollständige Versionshinweise: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-30.3.md

Fügt Chain-Split-Wiederherstellung für die BIP-110-(RDTS-)Ära hinzu: Ein Variantenwechsel löscht jetzt automatisch von der RDTS-durchsetzenden Variante geerbte Ungültigkeits-Urteile.`,
    pl_PL: `Aktualizuje Bitcoin Core do 30.3.

- Naprawia problem, w którym baza danych chainstate wielokrotnie zapisywała od nowa duże swoje fragmenty, powodując nadmierny odczyt i zapis dysku podczas normalnej pracy.
- Naprawia kilka błędów portfela: \`removeprunedfunds\` przy sprzecznych transakcjach, awarię podczas podbijania opłaty, gdy łączna opłata jest niedostępna, oraz kwotę błędnie obliczaną jako wartość logiczna przy wyborze monet.
- Ulepsza szacowanie rozmiaru wejść w portfelu i poprawia czas życia wstępnie obliczonych danych transakcji podczas walidacji.
- Naprawia przypadki brzegowe w PSBT i Miniscript, w tym walidację kluczy publicznych MuSig2.
- Zawiera zaktualizowane tłumaczenia.

Pełne informacje o wydaniu: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-30.3.md

Dodaje odzyskiwanie po podziale łańcucha na erę BIP-110 (RDTS): zmiana wariantu automatycznie czyści teraz werdykty nieważności bloków odziedziczone po wariancie egzekwującym RDTS.`,
    fr_FR: `Met à jour Bitcoin Core vers 30.3.

- Corrige un problème où la base de données chainstate réécrivait de façon répétée de grandes parties d'elle-même, provoquant des lectures et écritures disque excessives en fonctionnement normal.
- Corrige plusieurs bogues du portefeuille : \`removeprunedfunds\` avec des transactions en conflit, un plantage lors de l'augmentation des frais lorsque les frais combinés ne sont pas disponibles, et un montant calculé à tort comme un booléen lors de la sélection des pièces.
- Améliore l'estimation de la taille des entrées du portefeuille et corrige la durée de vie des données de transaction précalculées lors de la validation.
- Corrige des cas limites dans PSBT et Miniscript, dont la validation des clés publiques MuSig2.
- Inclut des traductions mises à jour.

Notes de version complètes : https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-30.3.md

Ajoute la récupération après scission de chaîne pour l'ère BIP-110 (RDTS) : changer de variante efface désormais automatiquement les verdicts de blocs invalides hérités de la variante appliquant RDTS.`,
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
  .satisfies('29.4:1')
  .satisfies('28.4:14')
