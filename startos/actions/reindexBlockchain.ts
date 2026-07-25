import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { i18n } from '../i18n'

export const reindexBlockchain = sdk.Action.withoutInput(
  // id
  'reindex-blockchain',

  // metadata
  async ({ effects }) => ({
    name: i18n('Reindex Blockchain'),
    description: i18n(
      'Rebuilds the block and chainstate databases starting from genesis. If blocks already exist on disk, these are used rather than being re-downloaded. For pruned nodes, this means downloading the entire blockchain over again.',
    ),
    warning: i18n(
      'Blocks not stored on disk will be re-downloaded in order to rebuild the database. If your node is pruned, this action is equivalent to syncing the node from scratch, so this process could take weeks on low-end hardware.',
    ),
    allowedStatuses: 'any',
    group: i18n('Reindex'),
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    await storeJson.merge(effects, {
      reindexBlockchain: true,
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
        message: i18n('Restarting bitcoind with -reindex argument'),
        result: null,
      }
    }

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n(
        'The next time bitcoind is started it will be run with the -reindex argument',
      ),
      result: null,
    }
  },
)
