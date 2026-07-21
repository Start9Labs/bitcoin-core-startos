import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const shape = z
  .object({
    reindexBlockchain: z.boolean().catch(false),
    reindexChainstate: z.boolean().catch(false),
    /** Set when leaving the RDTS-enforcing flavor: on next start, clear
     *  persisted invalid-block verdicts on chain tips (reconsiderblock).
     *  Present in every bitcoind flavor's shape so a flavor switch never
     *  strips a pending flag from the shared store. */
    reconsiderInvalidTips: z.boolean().catch(false),
    /** Set when entering/activating RDTS enforcement on a datadir that may
     *  have advanced under non-enforcing rules: on next start, re-validate
     *  the RDTS-applicable block range (invalidateblock+reconsiderblock).
     *  Present in every flavor's shape; only the RDTS flavor consumes it. */
    revalidateFromRdts: z.boolean().catch(false),
    /** Warning-dedup marker for the requires-reindex outcome of RDTS
     *  re-validation: set once the "cannot replay in place" warning has been
     *  posted so it is not re-posted every start while the condition persists;
     *  cleared when re-validation resolves (not-applicable / revalidated).
     *  Only the RDTS-enforcing flavor writes it. */
    rdtsReindexWarned: z.boolean().catch(false),
    /** Whether the binary that last advanced this datadir enforced the RDTS
     *  consensus rules — the package-level durable marker bitcoind itself
     *  lacks (its persisted block verdicts don't record which rules
     *  produced them). Every flavor records it each start; a transition
     *  materializes the recovery flag above (undefined = legacy datadir,
     *  treated as unknown → re-validate when enforcement is on). */
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
