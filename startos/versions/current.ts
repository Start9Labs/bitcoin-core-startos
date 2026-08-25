import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { i2pdConfFile } from '../fileModels/i2pd.conf'

export const current = VersionInfo.of({
  version: '28.4:25',
  releaseNotes: {
    en_US: `- The service log is no longer buried under the I2P router's routine chatter.
- The I2P router now carries only your node's traffic, and connects more reliably.
- Blockchain Sync reports the step the node is actually on while it starts.
- New Index Sync health check, for the transaction, coinstats and block filter indexes.
- Switching between Core and Knots no longer reports a chain recovery failure that did not happen.
- Turning the I2P SAM Proxy off no longer leaves the node unable to start.
- On a pruned node, blocks fetched from peers for other services now include their witness data, and arrive faster.
- Other under-the-hood fixes and improvements.`,
    es_ES: `- El registro del servicio ya no queda sepultado bajo el parloteo rutinario del router I2P.
- El router I2P ahora solo transporta el tráfico de su nodo y se conecta de forma más fiable.
- Sincronización de blockchain indica el paso en el que está realmente el nodo mientras arranca.
- Nueva comprobación de estado, Sincronización de índices, para los índices de transacciones, coinstats y filtros de bloques.
- Cambiar entre Core y Knots ya no informa de un error de recuperación de la cadena que no ocurrió.
- Desactivar el proxy SAM de I2P ya no impide que el nodo arranque.
- En un nodo podado, los bloques obtenidos de los pares para otros servicios ahora incluyen sus datos de testigo y llegan más rápido.
- Otras correcciones y mejoras internas.`,
    de_DE: `- Das Dienstprotokoll wird nicht mehr vom Routinegeplapper des I2P-Routers begraben.
- Der I2P-Router trägt jetzt nur noch den Verkehr Ihres Knotens und verbindet sich zuverlässiger.
- Die Blockchain-Synchronisierung zeigt den Schritt an, bei dem der Knoten beim Start tatsächlich ist.
- Neue Statusprüfung „Index-Synchronisierung“ für Transaktions-, Coinstats- und Blockfilter-Indizes.
- Der Wechsel zwischen Core und Knots meldet keinen Kettenwiederherstellungsfehler mehr, der nicht aufgetreten ist.
- Das Abschalten des I2P-SAM-Proxys verhindert nicht mehr den Start des Knotens.
- Auf einem beschnittenen Knoten enthalten von Peers für andere Dienste abgerufene Blöcke jetzt ihre Witness-Daten und treffen schneller ein.
- Weitere Korrekturen und Verbesserungen unter der Haube.`,
    pl_PL: `- Dziennik usługi nie jest już zasypywany rutynowymi komunikatami routera I2P.
- Router I2P przenosi teraz wyłącznie ruch Twojego węzła i łączy się bardziej niezawodnie.
- Synchronizacja blockchaina pokazuje etap, na którym węzeł faktycznie się znajduje podczas uruchamiania.
- Nowa kontrola stanu „Synchronizacja indeksów” dla indeksu transakcji, coinstats i filtrów bloków.
- Przełączanie między Core i Knots nie zgłasza już nieudanego odzyskiwania łańcucha, które nie miało miejsca.
- Wyłączenie proxy SAM I2P nie uniemożliwia już uruchomienia węzła.
- W przyciętym węźle bloki pobierane od peerów na potrzeby innych usług zawierają teraz dane świadka i docierają szybciej.
- Inne poprawki i usprawnienia wewnętrzne.`,
    fr_FR: `- Le journal du service n'est plus enseveli sous le bavardage ordinaire du routeur I2P.
- Le routeur I2P ne transporte plus que le trafic de votre nœud et se connecte de façon plus fiable.
- La synchronisation de la blockchain indique l'étape à laquelle le nœud se trouve réellement au démarrage.
- Nouvelle vérification d'état « Synchronisation des index » pour les index de transactions, coinstats et filtres de blocs.
- Basculer entre Core et Knots ne signale plus un échec de récupération de chaîne qui n'a pas eu lieu.
- Désactiver le proxy SAM I2P n'empêche plus le nœud de démarrer.
- Sur un nœud élagué, les blocs récupérés auprès des pairs pour d'autres services incluent désormais leurs données de témoin et arrivent plus vite.
- Autres correctifs et améliorations internes.`,
  },
  migrations: {
    up: async ({ effects }) => {
      // Move the i2pd router off the two old shipped defaults, once: the
      // 'L' bandwidth class, and relaying transit for other I2P users. A
      // hand-set value is indistinguishable from the default it replaced,
      // so both are moved and both are disclosed in the release notes.
      // Rationale: fileModels/i2pd.conf.ts. Guarded twice: the read is
      // null-safe for legacy paths where i2pd.conf does not exist yet, and
      // the whole step is try/caught because neither move is worth
      // aborting an update over — an unreadable or unwritable i2pd.conf
      // just skips it.
      try {
        const conf = await i2pdConfFile.read().once()
        await i2pdConfFile.merge(effects, {
          ...(conf?.bandwidth === 'L' && { bandwidth: 'O' as const }),
          ...(conf?.notransit === false && { notransit: true }),
        })
      } catch (e) {
        console.error('i2pd router defaults not moved:', e)
      }
    },
    down: IMPOSSIBLE,
  },
})
