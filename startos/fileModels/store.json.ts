import { FileHelper, matches } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const { object, boolean } = matches

export const shape = object({
  reindexBlockchain: boolean,
  reindexChainstate: boolean,
  fullySynced: boolean,
  snapshotInUse: boolean,
})

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/store.json',
  },
  shape,
)
