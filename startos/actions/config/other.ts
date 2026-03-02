import { bitcoinConfFile, fullConfigSpec } from '../../fileModels/bitcoin.conf'
import { storeJson } from '../../fileModels/store.json'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

export const otherConfig = sdk.Action.withInput(
  // id
  'other-config',

  // metadata
  async ({ effects }) => ({
    name: i18n('Other Settings'),
    description: i18n('Edit more values in bitcoin.conf'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  // form input specification
  fullConfigSpec.filter({
    blockfilters: true,
    blocknotify: true,
    coinstatsindex: true,
    dbbatchsize: true,
    dbcache: true,
    peerbloomfilters: true,
    prune: true,
    txindex: true,
    wallet: true,
    zmqEnabled: true,
  }),

  // optionally pre-fill the input form
  async ({ effects }) => bitcoinConfFile.read().once(),

  // the execution function
  async ({ effects, input }) => {
    const oldPrune = await bitcoinConfFile.read((c) => c.prune).once()

    await bitcoinConfFile.merge(effects, input)

    await storeJson.merge(effects, {
      reindexBlockchain: !!oldPrune && !input.prune,
    })
  },
)
