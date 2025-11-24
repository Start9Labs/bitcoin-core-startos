import { T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { GetBlockchainInfo, GetNetworkInfo, rootDir, ipcSocketPath } from '../utils'
import { mainMounts } from '../main'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { storeJson } from '../fileModels/store.json'
import { rpcPort } from '../utils'

export const runtimeInfo = sdk.Action.withoutInput(
  // id
  'runtime-info',

  // metadata
  async ({ effects }) => ({
    name: 'Runtime Information',
    description:
      'Network and other runtime information about this Bitcoin node',
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  // execution function
  async ({ effects }) => {
    const conf = (await bitcoinConfFile.read().const(effects))!
    // getnetowrkinfo

    const networkInfoRes = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'bitcoind' },
      mainMounts,
      'getnetworkinfo',
      async (subc) => {
        return await subc.execFail([
          'bitcoin-cli',
          `-conf=${rootDir}/bitcoin.conf`,
          `-rpccookiefile=${rootDir}/.cookie`,
          `-rpcport=${conf.prune ? 18332 : rpcPort}`,
          'getnetworkinfo',
        ])
      },
    )

    const networkInfoRaw: GetNetworkInfo = JSON.parse(
      networkInfoRes.stdout as string,
    )

    // getblockchaininfo

    const blockchainInfoRes = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'bitcoind' },
      mainMounts,
      'getblockchaininfo',
      async (subc) => {
        return await subc.execFail([
          'bitcoin-cli',
          `-conf=${rootDir}/bitcoin.conf`,
          `-rpccookiefile=${rootDir}/.cookie`,
          `-rpcport=${conf.prune ? 18332 : rpcPort}`,
          'getblockchaininfo',
        ])
      },
    )

    const blockchainInfoRaw: GetBlockchainInfo = JSON.parse(
      blockchainInfoRes.stdout as string,
    )

    // return
    const value = [
      getConnections(networkInfoRaw),
    ]

    const store = await storeJson.read().const(effects)
    if (store?.enableIpc !== false) { // Default to true if not set
      value.push(getIpcSocketPath())
    }

    value.push(getBlockchainInfo(blockchainInfoRaw))

    if (blockchainInfoRaw.softforks) {
      value.push(getSoftforkInfo(blockchainInfoRaw))
    }

    return {
      version: '1',
      title: 'Node Runtime Info',
      message: null,
      result: { type: 'group', value },
    }
  },
)

function getConnections(networkInfoRaw: GetNetworkInfo): T.ActionResultMember {
  return {
    type: 'single',
    name: 'Connections',
    description: 'The number of peers connected (inbound and outbound)',
    value: `${networkInfoRaw.connections} (${networkInfoRaw.connections_in} in / ${networkInfoRaw.connections_out} out)`,
    copyable: false,
    masked: false,
    qr: false,
  }
}

function getIpcSocketPath(): T.ActionResultMember {
  return {
    type: 'single',
    name: 'IPC Socket Path',
    description: 'Unix socket path for IPC communication with Bitcoin Core. Other services can bind to this socket in their Docker configuration.',
    value: ipcSocketPath,
    copyable: true,
    masked: false,
    qr: false,
  }
}

function getBlockchainInfo(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultMember {
  return {
    type: 'group',
    name: 'Blockchain Info',
    description: null,
    value: [
      {
        type: 'single',
        name: 'Block Height',
        value: String(blockchainInfoRaw.headers),
        description: 'The current block height for the network',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Synced Block Height',
        value: String(blockchainInfoRaw.blocks),
        description: 'The number of blocks the node has verified',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Sync Progress',
        value:
          blockchainInfoRaw.blocks < blockchainInfoRaw.headers ||
          blockchainInfoRaw.blocks === 0
            ? `${(blockchainInfoRaw.verificationprogress * 100).toFixed(2)}%`
            : '100%',
        description: 'The percentage of the blockchain that has been verified',
        copyable: false,
        masked: false,
        qr: false,
      },
    ],
  }
}

function getSoftforkInfo(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultMember {
  return {
    type: 'group',
    name: 'Softfork Info',
    description: null,
    value: [
      {
        type: 'group',
        name: 'Softforks',
        description: null,
        value: getSoftforks(blockchainInfoRaw),
      },
    ],
  }
}

function getSoftforks(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultMember[] {
  return Object.entries(blockchainInfoRaw.softforks).map(([key, val]) => {
    const value: T.ActionResultMember[] = [
      {
        type: 'single',
        name: 'Type',
        value: val.type,
        description: 'Either "buried", "bip9"',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Height',
        value: val.height ? String(val.height) : 'N/A',
        description:
          'height of the first block which the rules are or will be enforced (only for "buried" type, or "bip9" type with "active" status)',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Active',
        value: String(val.active),
        description:
          'true if the rules are enforced for the mempool and the next block',
        copyable: false,
        masked: false,
        qr: false,
      },
    ]

    if (val.bip9) {
      value.push(getBip9Info(val.bip9))

      if (val.bip9.statistics) {
        value.push(getBip9Statistics(val.bip9.statistics))
      }
    }

    return { type: 'group', name: key, description: null, value }
  })
}

function getBip9Info(bip9: Bip9): T.ActionResultMember {
  const { status, bit, start_time, timeout, since } = bip9

  return {
    type: 'group',
    name: 'Bip9',
    description: null,
    value: [
      {
        type: 'single',
        name: 'Status',
        value: status,
        description:
          'One of "defined", "started", "locked_in", "active", "failed"',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Bit',
        value: bit ? String(bit) : 'N/A',
        description:
          'The bit (0-28) in the block version field used to signal this softfork (only for "started" status)',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Start Time',
        value: String(start_time),
        description:
          'The minimum median time past of a block at which the bit gains its meaning',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Timeout',
        value: String(timeout),
        description:
          'The median time past of a block at which the deployment is considered failed if not yet locked in',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Since',
        value: String(since),
        description: 'height of the first block to which the status applies',
        copyable: false,
        masked: false,
        qr: false,
      },
    ],
  }
}

function getBip9Statistics(statistics: Bip9Stats): T.ActionResultMember {
  const { period, threshold, elapsed, count, possible } = statistics

  return {
    type: 'group',
    name: 'Statistics',
    description: null,
    value: [
      {
        type: 'single',
        name: 'Period',
        value: String(period),
        description: 'The length in blocks of the BIP9 signalling period',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Threshold',
        value: String(threshold),
        description:
          'The number of blocks with the version bit set required to activate the feature',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Elapsed',
        value: String(elapsed),
        description:
          'The number of blocks elapsed since the beginning of the current period',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Count',
        value: String(count),
        description:
          'The number of blocks with the version bit set in the current period',
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: 'Possible',
        value: String(possible),
        description:
          'returns false if there are not enough blocks left in this period to pass activation threshold',
        copyable: false,
        masked: false,
        qr: false,
      },
    ],
  }
}

type Bip9 = NonNullable<GetBlockchainInfo['softforks']['']['bip9']>
type Bip9Stats = NonNullable<Bip9['statistics']>
