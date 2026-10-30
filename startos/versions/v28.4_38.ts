import { FileHelper, IMPOSSIBLE, VersionInfo, z } from '@start9labs/start-sdk'
import { bitcoinConfFile, toBitcoinConf } from '../fileModels/bitcoin.conf'

export const v_28_4_38 = VersionInfo.of({
  version: '28.4:38',
  releaseNotes: {
    en_US:
      'Bitcoin now runs Block Notify commands that contain `=` or `;` or start with `[` as entered, and settings added to bitcoin.conf by hand keep their values as written. Block Notify can no longer contain `#`, and a command that did is removed.',
    es_ES:
      'Bitcoin ahora ejecuta tal como se introducen los comandos de Notificación de bloque que contienen `=` o `;` o empiezan por `[`, y los ajustes añadidos a mano a bitcoin.conf conservan sus valores tal como se escribieron. Notificación de bloque ya no puede contener `#`, y se elimina el comando que lo contuviera.',
    de_DE:
      'Bitcoin führt Blockbenachrichtigungs-Befehle, die `=` oder `;` enthalten oder mit `[` beginnen, jetzt genau wie eingegeben aus, und von Hand zu bitcoin.conf hinzugefügte Einstellungen behalten ihre Werte wie geschrieben. Die Blockbenachrichtigung darf kein `#` mehr enthalten; ein Befehl, der eines enthielt, wird entfernt.',
    pl_PL:
      'Bitcoin uruchamia teraz polecenia Powiadomienia o bloku zawierające `=` lub `;` albo zaczynające się od `[` dokładnie tak, jak je wpisano, a ustawienia dodane ręcznie do bitcoin.conf zachowują wartości w zapisanej postaci. Powiadomienie o bloku nie może już zawierać `#`, a polecenie, które je zawierało, zostaje usunięte.',
    fr_FR:
      "Bitcoin exécute désormais telles que saisies les commandes de Notification de bloc qui contiennent `=` ou `;` ou commencent par `[`, et les réglages ajoutés à la main dans bitcoin.conf conservent leurs valeurs telles qu'écrites. La Notification de bloc ne peut plus contenir `#`, et une commande qui en contenait est supprimée.",
  },
  migrations: {
    up: async ({ effects }) => {
      // Earlier releases wrote bitcoin.conf with FileHelper.ini's quoting and escapes.
      const conf = await FileHelper.ini(
        bitcoinConfFile.path,
        z.looseObject({}),
        { bracketedArray: false },
      )
        .read()
        .once()
      if (conf)
        await FileHelper.string(bitcoinConfFile.path).write(
          effects,
          toBitcoinConf(conf),
        )
    },
    down: IMPOSSIBLE,
  },
})
