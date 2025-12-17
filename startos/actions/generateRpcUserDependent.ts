import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import { getRpcAuth, getRpcUsers } from './deleteRpcAuth'
const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  username: Value.dynamicText(async ({ effects }) => {
    return {
      name: 'Username',
      description: 'RPC Auth Username',
      disabled: 'Cannot edit dependent specified username',
      required: true,
      default: null,
      patterns: [
        {
          regex: '^[a-zA-Z0-9_]+$',
          description: 'Must be alphanumeric (can contain underscore).',
        },
      ],
    }
  }),
  password: Value.dynamicText(async ({ effects }) => {
    return {
      name: 'Password',
      description: 'RPC Auth Password',
      disabled: 'Cannot edit dependent specified password',
      required: true,
      default: null,
      patterns: [
        {
          regex: '^[A-Za-z0-9_-]+$',
          description: 'Must be alphanumeric (can contain underscore).',
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
    name: 'Generate RPC Dependent Credentials',
    description:
      'Generate RPC Credentials using the provided username and password for a dependent service running locally',
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
        title: 'Error creating RPC Auth User',
        message: 'RPCAuth entry with this username already exists.',
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

      await bitcoinConfFile.merge(effects, { rpcauth: rpcAuthEntries })

      return {
        version: '1',
        title: 'Success',
        message: `RPC password created for ${username}`,
        result: null,
      }
    }

    return {
      version: '1',
      title: 'Failure',
      message: `rpcauth.py failed with error: ${res.stderr}`,
      result: null,
    }
  },
)