import { sdk } from '../sdk'
import { deleteIndex } from '../utils'
import { i18n } from '../i18n'

export const deleteBlockFilterIndex = sdk.Action.withoutInput(
  // id
  'delete-block-filter-index',

  // metadata
  async () => ({
    name: i18n('Delete Block Filter Index'),
    description: i18n(
      'Deletes the BIP158 Block Filter Index in case it gets corrupted, without deleting other indexes, blocks, or chainstate.',
    ),
    warning: i18n(
      "The Block Filter Index will be rebuilt on the next start if 'Compute Compact Block Filters (BIP158)' is enabled in Other Settings. Filter-based wallets must wait for the rebuild. If historical blocks have been pruned, rebuilding requires Reindex Blockchain and downloading the chain again; disable block filters to start without rebuilding.",
    ),
    allowedStatuses: 'only-stopped',
    group: i18n('Delete Corrupted Files'),
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    await deleteIndex(effects, 'blockfilter')

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n('Successfully deleted block filter index'),
      result: null,
    }
  },
)
