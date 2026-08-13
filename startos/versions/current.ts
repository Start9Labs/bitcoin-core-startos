import { VersionInfo } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'

export const current = VersionInfo.of({
  version: '30.3:8',
  releaseNotes: {
    en_US: `Stops the embedded I2P router logging an error every thirty seconds.

The health check that reports I2P status logged in before each query and handed the token it received back with that query. i2pd reads the token as a request it does not recognise and records an error for it — twice a minute, for as long as I2P is switched on. Nothing was actually wrong: I2P connectivity was unaffected and the check itself always reported correctly. The check now asks the router directly without logging in, which i2pd accepts because it never verifies the token it issues.`,
    es_ES: `Evita que el router I2P integrado registre un error cada treinta segundos.

La comprobación de estado que informa del estado de I2P iniciaba sesión antes de cada consulta y devolvía junto a ella el token recibido. i2pd interpreta ese token como una petición que no reconoce y registra un error por él: dos veces por minuto, mientras I2P esté activado. En realidad no pasaba nada: la conectividad I2P no se veía afectada y la propia comprobación siempre informaba correctamente. Ahora la comprobación consulta al router directamente, sin iniciar sesión, algo que i2pd acepta porque nunca verifica el token que emite.`,
    de_DE: `Verhindert, dass der eingebettete I2P-Router alle dreißig Sekunden einen Fehler protokolliert.

Die Zustandsprüfung, die den I2P-Status meldet, meldete sich vor jeder Abfrage an und reichte das erhaltene Token mit der Abfrage zurück. i2pd liest dieses Token als Anfrage, die es nicht kennt, und protokolliert dafür einen Fehler — zweimal pro Minute, solange I2P eingeschaltet ist. Tatsächlich war nichts kaputt: Die I2P-Verbindung war nicht betroffen, und die Prüfung selbst meldete stets korrekt. Die Prüfung fragt den Router jetzt direkt ab, ohne sich anzumelden; i2pd akzeptiert das, weil es das ausgegebene Token ohnehin nie überprüft.`,
    pl_PL: `Sprawia, że wbudowany router I2P przestaje zapisywać błąd co trzydzieści sekund.

Kontrola stanu raportująca status I2P logowała się przed każdym zapytaniem i odsyłała otrzymany token razem z tym zapytaniem. i2pd odczytuje ten token jako żądanie, którego nie rozpoznaje, i zapisuje z jego powodu błąd — dwa razy na minutę, dopóki I2P jest włączone. W rzeczywistości nic nie było nie tak: łączność I2P pozostawała nienaruszona, a sama kontrola zawsze raportowała poprawnie. Kontrola odpytuje teraz router bezpośrednio, bez logowania, co i2pd akceptuje, ponieważ i tak nigdy nie weryfikuje wydawanego tokenu.`,
    fr_FR: `Empêche le routeur I2P intégré de consigner une erreur toutes les trente secondes.

La vérification d'état qui rapporte le statut d'I2P s'authentifiait avant chaque requête et renvoyait avec celle-ci le jeton obtenu. i2pd lit ce jeton comme une requête qu'il ne reconnaît pas et consigne une erreur à son sujet — deux fois par minute, tant qu'I2P est activé. En réalité rien n'était en panne : la connectivité I2P n'était pas affectée et la vérification elle-même rapportait toujours correctement. La vérification interroge désormais le routeur directement, sans s'authentifier, ce que i2pd accepte puisqu'il ne vérifie jamais le jeton qu'il délivre.`,
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
