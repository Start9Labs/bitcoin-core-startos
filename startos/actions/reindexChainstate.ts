import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const reindexChainstate = sdk.Action.withoutInput(
  // id
  'reindex-chainstate',

  // metadata
  async ({ effects }) => ({
    name: 'Reindex Chainstate',
    description:
      "Rebuilds the chainstate database using existing block index data; as the block index is not rebuilt, 'reindex_chainstate' should be strictly faster than 'reindex'. This action should only be used in the case of chainstate corruption; if the blocks stored on disk are corrupted, the 'reindex' action will need to be run instead.",
    warning:
      "While faster than 'Reindex', 'Reindex Chainstate' can still take several days or more to complete.",
    allowedStatuses: 'any',
    group: 'Reindex',
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

    const started = (await sdk.getStatus(effects, { packageId: 'bitcoind'})).started

    if (started) {
      await sdk.restart(effects)
  
      return {
        version: '1',
        title: 'Success',
        message:
          'Restarting bitcoind with -reindex-chainstate argument',
        result: null,
      }
    }

    return {
      version: '1',
      title: 'Success',
      message:
        'The next time bitcoind is started it will be run with the -reindex-chainstate argument',
      result: null,
    }
  },
)
