import { FileHelper, matches } from '@start9labs/start-sdk'

const { object, boolean } = matches

export const shape = object({
  reindexBlockchain: boolean,
  reindexChainstate: boolean,
  fullySynced: boolean,
  snapshotInUse: boolean,
  enableIpc: boolean.optional(),
})

export const storeJson = FileHelper.json(
  {
    volumeId: 'main',
    subpath: '/store.json',
  },
  shape,
)
