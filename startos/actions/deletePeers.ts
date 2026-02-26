import { sdk } from '../sdk'
import * as fs from 'fs/promises'
import { rootDir, bitcoinMounts } from '../utils'
import { i18n } from '../i18n'

export const deletePeers = sdk.Action.withoutInput(
  // id
  'delete-peers',

  // metadata
  async ({ effects }) => ({
    name: i18n('Delete Peer List'),
    description: i18n(
      'Deletes the Peer List (peers.dat) in case it gets corrupted.',
    ),
    warning: null,
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
      'delete-peers',
      async (subc) => {
        await fs.rm(`${subc.rootfs}/${rootDir}/peers.dat`, { force: true })
      },
    )

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n('Successfully deleted peers.dat'),
      result: null,
    }
  },
)
