import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '29.4:23',
  releaseNotes: {
    en_US:
      'Other Settings can set the block weight reserved for the coinbase transaction, and mining services can request it. Built with start-sdk 3.1.0.',
    es_ES:
      'Otras configuraciones permite fijar el peso de bloque reservado para la transacción coinbase, y los servicios de minería pueden solicitarlo. Compilado con start-sdk 3.1.0.',
    de_DE:
      'Unter Weitere Einstellungen lässt sich das für die Coinbase-Transaktion reservierte Blockgewicht festlegen, und Mining-Dienste können es anfordern. Erstellt mit start-sdk 3.1.0.',
    pl_PL:
      'W akcji Inne ustawienia można ustawić wagę bloku zarezerwowaną dla transakcji coinbase, a usługi wydobywcze mogą o nią prosić. Zbudowano z start-sdk 3.1.0.',
    fr_FR:
      'Les Autres paramètres permettent de définir le poids de bloc réservé à la transaction coinbase, et les services de minage peuvent le demander. Construit avec start-sdk 3.1.0.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
}).satisfies('28.4:29')
