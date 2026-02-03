import { mainMounts } from '../main'
import { sdk } from '../sdk'
import * as fs from 'fs/promises'
import { rootDir } from '../utils'
import { i18n } from '../i18n'

export const deleteCoinstatsIndex = sdk.Action.withoutInput(
  // id
  'delete-coinstats-index',

  // metadata
  async ({ effects }) => ({
    name: i18n('Delete Coinstats Index'),
    description: i18n(
      'Deletes the Coinstats Index (coinstatsindex) in case it gets corrupted.',
    ),
    warning: i18n(
      "The Coinstats Index will be rebuilt once Bitcoin Core is started again, unless 'Transaction Index' is disabled in the config settings. Please don't do this unless you fully understand what you are doing.",
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
      mainMounts,
      'delete-coinstats',
      async (subc) => {
        await fs.rmdir(`${subc.rootfs}/${rootDir}/indexes/coinstatsindex/`, {
          recursive: true,
        })
      },
    )

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n('Successfully deleted coinstats index'),
      result: null,
    }
  },
)
