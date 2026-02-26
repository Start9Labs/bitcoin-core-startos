import { sdk } from '../sdk'
import * as fs from 'fs/promises'
import { rootDir, bitcoinMounts } from '../utils'
import { i18n } from '../i18n'

export const deleteTxIndex = sdk.Action.withoutInput(
  // id
  'delete-txindex',

  // metadata
  async ({ effects }) => ({
    name: i18n('Delete Transaction Index'),
    description: i18n(
      'Deletes the Transaction Index (txindex) in the event it gets corrupted.',
    ),
    warning: i18n(
      "The Transaction Index will be rebuilt once Bitcoin Core is started again, unless 'Coinstats Index' is disabled in the config settings. Please don't do this unless you fully understand what you are doing.",
    ),
    allowedStatuses: 'only-stopped',
    group: i18n('Delete Corrupted Files'),
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'bitcoind' },
      bitcoinMounts,
      'delete-txindex',
      async (subc) => {
        await fs.rmdir(`${subc.rootfs}/${rootDir}/indexes/txindex`, {
          recursive: true,
        })
      },
    )

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n('Successfully deleted txindex'),
      result: null,
    }
  },
)
