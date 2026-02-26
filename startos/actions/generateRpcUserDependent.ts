import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import { getRpcAuth, getRpcUsers } from './deleteRpcAuth'
import { i18n } from '../i18n'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  username: Value.dynamicText(async ({ effects }) => {
    return {
      name: i18n('Username'),
      description: i18n('RPC Auth Username'),
      disabled: i18n('Cannot edit dependent specified username'),
      required: true,
      default: null,
      patterns: [
        {
          regex: '^[a-zA-Z0-9_]+$',
          description: i18n('Must be alphanumeric (can contain underscore).'),
        },
      ],
    }
  }),
  password: Value.dynamicText(async ({ effects }) => {
    return {
      name: i18n('Password'),
      description: i18n('RPC Auth Password'),
      disabled: i18n('Cannot edit dependent specified password'),
      required: true,
      default: null,
      masked: true,
      patterns: [
        {
          regex: '^[A-Za-z0-9_-]+$',
          description: i18n('Must be alphanumeric (can contain underscore).'),
        },
      ],
    }
  }),
})

export const generateRpcUserDependent = sdk.Action.withInput(
  // id
  'generate-rpc-dependent',

  // metadata
  async ({ effects }) => ({
    name: i18n('Create RPC Credentials'),
    description: i18n(
      'Generate RPC Credentials using the provided username and password for a dependent service running locally',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    const existingUsernames = await getRpcUsers(effects)
    const { username, password } = input

    if (existingUsernames?.includes(username!)) {
      return {
        version: '1',
        title: i18n('Error creating RPC Auth User'),
        message: i18n('RPCAuth entry with this username already exists.'),
        result: null,
      }
    }

    const mountpoint = '/scripts'

    const res = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'python' },
      sdk.Mounts.of().mountAssets({ subpath: null, mountpoint }),
      'RPC Auth Generator',
      (subc) =>
        subc.exec([
          'python3',
          `${mountpoint}/rpcauth.py`,
          `${username}`,
          `${password}`,
        ]),
    )

    if (res.exitCode === 0 && typeof res.stdout === 'string') {
      const newRpcAuth = res.stdout.split('\n')[1].trim().split('=')[1].trim()

      const existingRpcAuthEntries = (await getRpcAuth(effects)) || []
      const rpcAuthEntries = [existingRpcAuthEntries].flat()
      rpcAuthEntries.push(newRpcAuth)

      await bitcoinConfFile.merge(effects, { raw: { rpcauth: rpcAuthEntries } })

      return {
        version: '1',
        title: i18n('Success'),
        message: i18n('RPC password created for ${username}', {
          username: username!,
        }),
        result: null,
      }
    }

    return {
      version: '1',
      title: i18n('Failure'),
      message: i18n('rpcauth.py failed with error: ${error}', {
        error: res.stderr as string,
      }),
      result: null,
    }
  },
)
