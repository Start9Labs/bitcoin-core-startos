import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main', 'i2pd').setOptions({
    exclude: [
      // main
      'blocks/',
      'chainstate/',
      'chainstate.old/',
      'indexes/',
      '.cookie',
      '**/*-journal',
      // i2pd
      'data/addressbook/',
      'data/certificates/',
      'data/netDb/',
      'data/peerProfiles/',
      'data/tags/',
      'data/i2pd.pid',
      'data/router.info',
    ],
  }),
)
