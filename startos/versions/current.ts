import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:9',
  releaseNotes: {
    en_US: `Small cleanups around the embedded I2P router.

- If you switched to Bitcoin Core from Bitcoin Knots (RDTS), a leftover consensusrules line in bitcoin.conf made every start log "Ignoring unknown configuration value". It is now removed automatically.
- The I2P health check treated an unusable reply from the router as healthy; it now reports "starting" until the router gives a real answer.
- i2pd no longer warns on every start about an optional tunnels file that was never shipped.`,
    es_ES: `Pequeñas limpiezas en torno al router I2P integrado.

- Si cambiaste a Bitcoin Core desde Bitcoin Knots (RDTS), una línea consensusrules sobrante en bitcoin.conf hacía que cada arranque registrara «Ignoring unknown configuration value». Ahora se elimina automáticamente.
- La comprobación de estado de I2P trataba una respuesta inutilizable del router como si todo fuera bien; ahora informa «iniciando» hasta que el router da una respuesta real.
- i2pd ya no avisa en cada arranque sobre un archivo de túneles opcional que nunca se incluyó.`,
    de_DE: `Kleine Aufräumarbeiten rund um den eingebetteten I2P-Router.

- Wer von Bitcoin Knots (RDTS) zu Bitcoin Core gewechselt ist, hatte eine übrig gebliebene consensusrules-Zeile in der bitcoin.conf, die bei jedem Start "Ignoring unknown configuration value" protokollierte. Sie wird jetzt automatisch entfernt.
- Die I2P-Zustandsprüfung wertete eine unbrauchbare Antwort des Routers als gesund; sie meldet jetzt "startet", bis der Router eine echte Antwort gibt.
- i2pd warnt beim Start nicht mehr über eine optionale Tunnel-Datei, die nie mitgeliefert wurde.`,
    pl_PL: `Drobne porządki wokół wbudowanego routera I2P.

- Jeśli przeszedłeś na Bitcoin Core z Bitcoin Knots (RDTS), pozostawiona linia consensusrules w bitcoin.conf sprawiała, że każdy start zapisywał "Ignoring unknown configuration value". Teraz jest usuwana automatycznie.
- Kontrola stanu I2P traktowała bezużyteczną odpowiedź routera jako zdrową; teraz zgłasza "uruchamianie", dopóki router nie udzieli prawdziwej odpowiedzi.
- i2pd nie ostrzega już przy każdym starcie o opcjonalnym pliku tuneli, którego nigdy nie dołączano.`,
    fr_FR: `Petits nettoyages autour du routeur I2P intégré.

- Si vous êtes passé à Bitcoin Core depuis Bitcoin Knots (RDTS), une ligne consensusrules restée dans bitcoin.conf faisait consigner « Ignoring unknown configuration value » à chaque démarrage. Elle est désormais retirée automatiquement.
- La vérification d'état d'I2P considérait une réponse inutilisable du routeur comme saine ; elle signale désormais « démarrage » tant que le routeur ne donne pas de vraie réponse.
- i2pd n'avertit plus à chaque démarrage au sujet d'un fichier de tunnels optionnel qui n'a jamais été fourni.`,
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
  .satisfies('29.4:8')
  .satisfies('28.4:21')
