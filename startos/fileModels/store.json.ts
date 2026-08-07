import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const shape = z
  .object({
    reindexBlockchain: z.boolean().catch(false),
    reindexChainstate: z.boolean().catch(false),
    /** Set when leaving the RDTS-enforcing flavor: on next start, clear
     *  persisted invalid-block verdicts on chain tips (reconsiderblock).
     *  Present in every bitcoind flavor's shape so a flavor switch never
     *  strips a pending flag from the shared store — this shape `.strip()`s
     *  keys it doesn't declare. */
    reconsiderInvalidTips: z.boolean().catch(false),
    /** Whether the binary that last advanced this datadir enforced the RDTS
     *  consensus rules — the package-level durable marker bitcoind itself
     *  lacks (its persisted block verdicts don't record which rules
     *  produced them). Every flavor records it each start; the non-enforcing
     *  flavors read it to recognize inherited RDTS verdicts as foreign
     *  (undefined = legacy datadir, treated as unknown → reconsider). */
    rdtsEnforcedLastRun: z.boolean().optional().catch(undefined),
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
