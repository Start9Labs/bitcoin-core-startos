import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import { i18n } from '../i18n'
const { InputSpec, Value } = sdk

export async function getRpcUsers(effects: Effects) {
  const rpcauth = await getRpcAuth(effects)
  if (!rpcauth) return
  return [rpcauth].flat().filter((e): e is string => !!e).map((e) => e.split(':', 2)[0])
}

export async function getRpcAuth(effects: Effects) {
  return (await bitcoinConfFile.read().const(effects))?.raw?.rpcauth
}

export const inputSpec = InputSpec.of({
  deletedRpcUsers: Value.dynamicMultiselect(async ({ effects }) => {
    const existingUsernames = (await getRpcUsers(effects)) || []

    return {
      name: i18n('Existing RPC Users'),
      default: [],
      values: existingUsernames.reduce(
        (obj, curr) => ({ ...obj, [curr]: curr }),
        {} as Record<string, string>,
      ),
    }
  }),
})

export const deleteRpcAuth = sdk.Action.withInput(
  // id
  'delete-rpcauth',

  // metadata
  async ({ effects }) => {
    const rpcUsers = await getRpcUsers(effects)
    return {
      name: i18n('Delete RPC Users'),
      description: i18n(
        'Delete RPC users from Bitcoin.conf. You may want to run this action if the RPC Auth entry is no longer needed or if the password is lost.',
      ),
      warning: null,
      allowedStatuses: 'any',
      group: i18n('RPC Users'),
      visibility:
        rpcUsers && rpcUsers.length > 0
          ? 'enabled'
          : { disabled: i18n('There are no RPC users') },
    }
  },

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    const rpcauth = (await getRpcAuth(effects))!
    const filtered = [rpcauth]
      .flat()
      .filter((auth): auth is string => !!auth && !input.deletedRpcUsers.includes(auth.split(':', 2)[0]))
    await bitcoinConfFile.merge(effects, { raw: { rpcauth: filtered } })
  },
)
