import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { reconsiderInvalidTips } from '../forkRecovery'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { bitcoinMounts } from '../utils'

export const reconsiderInvalidBlocks = sdk.Action.withoutInput(
  // id
  'reconsider-invalid-blocks',

  // metadata
  async ({ effects }) => ({
    name: i18n('Reconsider Invalid Blocks'),
    description: i18n(
      'Clear the persisted invalid verdict from every invalid chain tip, letting the node re-evaluate those branches under the currently running consensus rules and follow the best chain that is valid under them. Use after switching bitcoind flavors across a chain split, so verdicts inherited from the previous flavor cannot pin the node to the wrong chain. Safe: branches that are invalid under the running rules are re-marked invalid automatically, and the action is a no-op when no invalid tips exist.',
    ),
    warning: i18n(
      'If a reconsidered branch has more work than the current chain, the node reorganizes onto it after re-validating it, which can take a while. Reaching a branch this node has not downloaded also requires peers that serve it.',
    ),
    allowedStatuses: 'only-running',
    group: i18n('Chain Recovery'),
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    const conf = (await bitcoinConfFile.read().const(effects))!

    const result = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'bitcoind' },
      bitcoinMounts,
      'reconsider-invalid-blocks',
      (subc) => reconsiderInvalidTips(subc, { prune: !!conf.prune }),
    )

    if (!result.reconsidered.length && !result.skippedPruned.length) {
      return {
        version: '1',
        title: i18n('Success'),
        message: i18n(
          'No invalid chain tips found — there was nothing to reconsider.',
        ),
        result: null,
      }
    }

    const skipped = result.skippedPruned.length
      ? ' ' +
        i18n(
          '${count} invalid tip(s) were left alone because this pruned node no longer stores the blocks needed to reorganize onto them; recovering those chains requires Reindex Blockchain (a re-download on pruned nodes).',
          { count: String(result.skippedPruned.length) },
        )
      : ''

    return {
      version: '1',
      title: i18n('Success'),
      message:
        i18n(
          'Cleared invalid verdicts on ${count} chain tip(s). The node will now follow the best chain that is valid under its current consensus rules; reorganizing onto a better chain may take a while and requires peers that serve it.',
          { count: String(result.reconsidered.length) },
        ) + skipped,
      result: null,
    }
  },
)
