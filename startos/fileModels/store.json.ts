import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const shape = z
  .object({
    reindexBlockchain: z.boolean().catch(false),
    reindexChainstate: z.boolean().catch(false),
    fullySynced: z.boolean().catch(false),
    snapshotInUse: z.boolean().catch(false),
  })
  .strip()

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/store.json',
  },
  shape,
)
