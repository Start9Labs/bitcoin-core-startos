import { VersionInfo } from '@start9labs/start-sdk'

export const v_31_0_7 = VersionInfo.of({
  version: '31.0:7',
  releaseNotes: {
    en_US:
      'Upstream Bitcoin Core 31.0 (cluster mempool, higher default dbcache on systems with 4+ GiB of RAM, removal of the deprecated paytxfee/settxfee/maxorphantx settings). New Private Broadcast toggle routes sendrawtransaction over a fresh Tor or I2P circuit per transaction. Includes all 30.x:7 UI, health-check and SDK improvements.',
    es_ES:
      'Bitcoin Core 31.0 aguas arriba (mempool por clústeres, mayor valor predeterminado de dbcache en sistemas con 4+ GiB de RAM, eliminación de las opciones obsoletas paytxfee/settxfee/maxorphantx). El nuevo interruptor Transmisión privada enruta sendrawtransaction por un circuito Tor o I2P nuevo en cada transacción. Incluye todas las mejoras de interfaz, comprobaciones de salud y SDK de 30.x:7.',
    de_DE:
      'Upstream Bitcoin Core 31.0 (Cluster-Mempool, höherer Standardwert für dbcache auf Systemen mit 4+ GiB RAM, Entfernung der veralteten Optionen paytxfee/settxfee/maxorphantx). Der neue Schalter „Privater Broadcast" leitet sendrawtransaction pro Transaktion über eine frische Tor- oder I2P-Verbindung. Enthält alle UI-, Health-Check- und SDK-Verbesserungen aus 30.x:7.',
    pl_PL:
      'Upstream Bitcoin Core 31.0 (mempool klastrowy, większa domyślna wartość dbcache w systemach z 4+ GiB RAM, usunięcie przestarzałych ustawień paytxfee/settxfee/maxorphantx). Nowy przełącznik „Prywatne rozgłaszanie" kieruje sendrawtransaction przez osobne połączenie Tor lub I2P na każdą transakcję. Zawiera wszystkie usprawnienia UI, kontroli stanu i SDK z 30.x:7.',
    fr_FR:
      "Bitcoin Core 31.0 amont (mempool en grappes, valeur par défaut de dbcache augmentée sur les systèmes disposant d'au moins 4 Gio de RAM, suppression des options obsolètes paytxfee/settxfee/maxorphantx). La nouvelle bascule « Diffusion privée » achemine sendrawtransaction via un circuit Tor ou I2P distinct pour chaque transaction. Inclut toutes les améliorations d'UI, de vérifications de santé et de SDK de 30.x:7.",
  },
  migrations: {
    down: async ({ effects }) => {},
  },
})
