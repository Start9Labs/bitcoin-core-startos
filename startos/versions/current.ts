import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '31.1:0',
  releaseNotes: {
    en_US: `Updated Bitcoin Core to 31.1.

- Fixes an IP address leak when using \`-privatebroadcast\`: under certain circumstances connections were made over clearnet instead of the enabled privacy network.
- Fixes an issue where the chainstate database repeatedly rewrote large portions of itself, causing excessive disk reads and writes during normal operation.
- Corrects the lifetime of precomputed transaction data during validation, and uses the configured proxy when reconnecting from v2 to v1 transport.
- Wallet fixes: the final BDB page is now checked during migration, and input size estimation is more accurate.
- Includes updated translations.

Full release notes: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.1.md

Adds chain-split recovery for the BIP-110 (RDTS) era: switching flavors now automatically clears invalid-block verdicts inherited from the RDTS-enforcing flavor.`,
    es_ES: `Actualiza Bitcoin Core a 31.1.

- Corrige una filtración de la dirección IP al usar \`-privatebroadcast\`: en ciertas circunstancias las conexiones se realizaban por clearnet en lugar de por la red de privacidad activada.
- Corrige un problema por el cual la base de datos del chainstate reescribía repetidamente grandes partes de sí misma, provocando lecturas y escrituras de disco excesivas durante el funcionamiento normal.
- Corrige el tiempo de vida de los datos precalculados de las transacciones durante la validación y utiliza el proxy configurado al reconectar del transporte v2 al v1.
- Correcciones del monedero: ahora se comprueba la última página BDB durante la migración y la estimación del tamaño de las entradas es más precisa.
- Incluye traducciones actualizadas.

Notas de la versión completas: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.1.md

Añade recuperación ante divisiones de cadena para la era BIP-110 (RDTS): cambiar de variante ahora borra automáticamente los veredictos de bloques inválidos heredados de la variante que aplica RDTS.`,
    de_DE: `Aktualisiert Bitcoin Core auf 31.1.

- Behebt ein Leck der IP-Adresse bei Verwendung von \`-privatebroadcast\`: Unter bestimmten Umständen wurden Verbindungen über das Clearnet statt über das aktivierte Privatsphäre-Netzwerk aufgebaut.
- Behebt ein Problem, bei dem die Chainstate-Datenbank wiederholt große Teile von sich selbst neu schrieb und dadurch im normalen Betrieb übermäßige Lese- und Schreibvorgänge auf der Festplatte verursachte.
- Korrigiert die Lebensdauer der vorberechneten Transaktionsdaten während der Validierung und verwendet beim Zurückwechseln vom v2- auf den v1-Transport den konfigurierten Proxy.
- Wallet-Korrekturen: Die letzte BDB-Seite wird bei der Migration geprüft, und die Schätzung der Eingabegröße ist genauer.
- Enthält aktualisierte Übersetzungen.

Vollständige Versionshinweise: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.1.md

Fügt Chain-Split-Wiederherstellung für die BIP-110-(RDTS-)Ära hinzu: Ein Variantenwechsel löscht jetzt automatisch von der RDTS-durchsetzenden Variante geerbte Ungültigkeits-Urteile.`,
    pl_PL: `Aktualizuje Bitcoin Core do 31.1.

- Naprawia wyciek adresu IP przy korzystaniu z \`-privatebroadcast\`: w pewnych okolicznościach połączenia były nawiązywane przez clearnet zamiast przez włączoną sieć prywatności.
- Naprawia problem, w którym baza danych chainstate wielokrotnie zapisywała od nowa duże swoje fragmenty, powodując nadmierny odczyt i zapis dysku podczas normalnej pracy.
- Poprawia czas życia wstępnie obliczonych danych transakcji podczas walidacji oraz używa skonfigurowanego proxy przy ponownym łączeniu z transportu v2 na v1.
- Poprawki portfela: podczas migracji sprawdzana jest ostatnia strona BDB, a szacowanie rozmiaru wejść jest dokładniejsze.
- Zawiera zaktualizowane tłumaczenia.

Pełne informacje o wydaniu: https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.1.md

Dodaje odzyskiwanie po podziale łańcucha na erę BIP-110 (RDTS): zmiana wariantu automatycznie czyści teraz werdykty nieważności bloków odziedziczone po wariancie egzekwującym RDTS.`,
    fr_FR: `Met à jour Bitcoin Core vers 31.1.

- Corrige une fuite d'adresse IP lors de l'utilisation de \`-privatebroadcast\` : dans certaines circonstances, les connexions étaient établies via le clearnet au lieu du réseau de confidentialité activé.
- Corrige un problème où la base de données chainstate réécrivait de façon répétée de grandes parties d'elle-même, provoquant des lectures et écritures disque excessives en fonctionnement normal.
- Corrige la durée de vie des données de transaction précalculées lors de la validation et utilise le proxy configuré lors d'une reconnexion du transport v2 vers v1.
- Corrections du portefeuille : la dernière page BDB est vérifiée lors de la migration et l'estimation de la taille des entrées est plus précise.
- Inclut des traductions mises à jour.

Notes de version complètes : https://github.com/bitcoin/bitcoin/blob/master/doc/release-notes/release-notes-31.1.md

Ajoute la récupération après scission de chaîne pour l'ère BIP-110 (RDTS) : changer de variante efface désormais automatiquement les verdicts de blocs invalides hérités de la variante appliquant RDTS.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {
      // v31 changed CURRENT_FEES_FILE_VERSION (149900 → 309900) and the
      // fee estimator bucket size; ≤30 hard-fails on a v31-written file.
      await rm('/media/startos/volumes/main/fee_estimates.dat', {
        force: true,
      }).catch(console.error)
    },
  },
})
  .satisfies('30.3:0')
  .satisfies('29.4:0')
  .satisfies('28.4:13')
