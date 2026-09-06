import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:29',
  releaseNotes: {
    en_US: `- Restarting Bitcoin no longer leaves dependent services unable to connect until this service is restarted too.
- On a pruned node, blocks from the 2016 SegWit signalling period can be fetched for dependent services again.`,
    es_ES: `- Reiniciar Bitcoin ya no deja a los servicios dependientes sin poder conectarse hasta que también se reinicie este servicio.
- En un nodo podado, los bloques del periodo de señalización de SegWit de 2016 vuelven a poder obtenerse para los servicios dependientes.`,
    de_DE: `- Ein Neustart von Bitcoin lässt abhängige Dienste nicht mehr ohne Verbindung zurück, bis auch dieser Dienst neu gestartet wird.
- Auf einem beschnittenen Knoten können Blöcke aus der SegWit-Signalisierungsphase von 2016 wieder für abhängige Dienste abgerufen werden.`,
    pl_PL: `- Ponowne uruchomienie Bitcoina nie pozostawia już usług zależnych bez połączenia do czasu ponownego uruchomienia także tej usługi.
- W przyciętym węźle bloki z okresu sygnalizacji SegWit z 2016 roku można ponownie pobierać na potrzeby usług zależnych.`,
    fr_FR: `- Redémarrer Bitcoin ne laisse plus les services dépendants incapables de se connecter jusqu'à ce que ce service soit lui aussi redémarré.
- Sur un nœud élagué, les blocs de la période de signalisation SegWit de 2016 peuvent à nouveau être récupérés pour les services dépendants.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
