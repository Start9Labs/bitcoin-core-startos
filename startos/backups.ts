import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main', 'i2pd').setOptions({
    exclude: [
      // main
      'blocks/',
      'chainstate/',
      'indexes/',
      // i2pd
      'addressbook/',
      'certificates/',
      'netDb/',
      'peerProfiles/',
      'tags/',
      'i2pd.pid',
      'router.info',
    ],
  }),
)
