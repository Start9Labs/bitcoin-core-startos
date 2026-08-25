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
      // i2pd. router.info is derived from router.keys but kept: restoring keys
      // without it lands i2pd on a "malformed, creating new" path that emits one
      // Identity parse error per netDb entry before it recovers.
      'data/addressbook/',
      'data/certificates/',
      'data/netDb/',
      'data/peerProfiles/',
      'data/tags/',
      'data/i2pd.pid',
    ],
  }),
)
