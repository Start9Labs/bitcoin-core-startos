import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:13',
  releaseNotes: {
    en_US:
      'Internal updates (start-sdk 2.0.x). Bitcoin now reaches Tor at a fixed internal bridge address and no longer restarts when Tor is installed, updated, or removed. Adds chain-split recovery for the BIP-110 (RDTS) era: switching flavors now automatically clears invalid-block verdicts inherited from the RDTS-enforcing flavor, and a new Chain Recovery action group (Reconsider Invalid Blocks) gives manual control.',
    es_ES:
      'Actualizaciones internas (start-sdk 2.0.x). Bitcoin ahora alcanza Tor en una dirección fija del puente interno y ya no se reinicia cuando Tor se instala, actualiza o elimina. Añade recuperación ante divisiones de cadena para la era BIP-110 (RDTS): cambiar de variante ahora borra automáticamente los veredictos de bloques inválidos heredados de la variante que aplica RDTS, y un nuevo grupo de acciones Recuperación de cadena (Reconsiderar bloques inválidos) ofrece control manual.',
    de_DE:
      'Interne Aktualisierungen (start-sdk 2.0.x). Bitcoin erreicht Tor jetzt über eine feste interne Bridge-Adresse und startet nicht mehr neu, wenn Tor installiert, aktualisiert oder entfernt wird. Fügt Chain-Split-Wiederherstellung für die BIP-110-(RDTS-)Ära hinzu: Ein Variantenwechsel löscht jetzt automatisch von der RDTS-durchsetzenden Variante geerbte Ungültigkeits-Urteile, und eine neue Aktionsgruppe Chain-Wiederherstellung (Ungültige Blöcke überdenken) bietet manuelle Kontrolle.',
    pl_PL:
      'Aktualizacje wewnętrzne (start-sdk 2.0.x). Bitcoin łączy się teraz z Torem pod stałym adresem wewnętrznego mostka i nie restartuje się już przy instalacji, aktualizacji ani usunięciu Tora. Dodaje odzyskiwanie po podziale łańcucha na erę BIP-110 (RDTS): zmiana wariantu automatycznie czyści teraz werdykty nieważności bloków odziedziczone po wariancie egzekwującym RDTS, a nowa grupa akcji Odzyskiwanie łańcucha (Rozważ ponownie nieważne bloki) daje ręczną kontrolę.',
    fr_FR:
      "Mises à jour internes (start-sdk 2.0.x). Bitcoin atteint désormais Tor à une adresse fixe du pont interne et ne redémarre plus lorsque Tor est installé, mis à jour ou supprimé. Ajoute la récupération après scission de chaîne pour l'ère BIP-110 (RDTS) : changer de variante efface désormais automatiquement les verdicts de blocs invalides hérités de la variante appliquant RDTS, et un nouveau groupe d'actions Récupération de chaîne (Reconsidérer les blocs invalides) offre un contrôle manuel.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
