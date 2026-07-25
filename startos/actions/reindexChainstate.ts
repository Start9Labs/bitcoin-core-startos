import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { i18n } from '../i18n'

export const reindexChainstate = sdk.Action.withoutInput(
  // id
  'reindex-chainstate',

  // metadata
  async ({ effects }) => ({
    name: i18n('Reindex Chainstate'),
    description: i18n(
      "Rebuilds the chainstate database using existing block index data; as the block index is not rebuilt, 'reindex_chainstate' should be strictly faster than 'reindex'. This action should only be used in the case of chainstate corruption; if the blocks stored on disk are corrupted, the 'reindex' action will need to be run instead.",
    ),
    warning: i18n(
      "While faster than 'Reindex', 'Reindex Chainstate' can still take several days or more to complete.",
    ),
    allowedStatuses: 'any',
    group: i18n('Reindex'),
    visibility: (await bitcoinConfFile.read().const(effects))?.prune
      ? 'hidden'
      : 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    await storeJson.merge(effects, {
      reindexChainstate: true,
      fullySynced: false,
    })

    const status = await sdk
      .getStatus(effects, { packageId: 'bitcoind' })
      .once()

    if (status?.desired.main === 'running') {
      await sdk.restart(effects)

      return {
        version: '1',
        title: i18n('Success'),
        message: i18n('Restarting bitcoind with -reindex-chainstate argument'),
        result: null,
      }
    }

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n(
        'The next time bitcoind is started it will be run with the -reindex-chainstate argument',
      ),
      result: null,
    }
  },
)
