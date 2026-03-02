import { bitcoinConfFile, fullConfigSpec } from '../../fileModels/bitcoin.conf'
import { i18n } from '../../i18n'
import { sdk } from '../../sdk'

export const autoconfig = sdk.Action.withInput(
  // id
  'autoconfig',

  // metadata
  async ({ effects }) => ({
    name: i18n('Auto-Configure'),
    description: i18n(
      'Automatically configure bitcoin.conf for the needs of a another service',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  // input spec
  async ({ effects, prefill }) => {
    if (!prefill) return fullConfigSpec

    return fullConfigSpec
      .filterFromPartial(prefill as typeof fullConfigSpec._PARTIAL)
      .disableFromPartial(
        prefill as typeof fullConfigSpec._PARTIAL,
        i18n('These fields were provided by a task and cannot be edited'),
      )
  },

  // optionally pre-fill form
  async ({ effects }) => bitcoinConfFile.read().once(),

  // execution function
  ({ effects, input }) => bitcoinConfFile.merge(effects, input),
)
