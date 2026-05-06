import { T } from '@start9labs/start-sdk'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  bitcoinCliArgs,
  bitcoinMounts,
  GetBlockchainInfo,
  GetNetworkInfo,
} from '../utils'

export const runtimeInfo = sdk.Action.withoutInput(
  // id
  'runtime-info',

  // metadata
  async ({ effects }) => ({
    name: i18n('Runtime Information'),
    description: i18n(
      'Network and other runtime information about this Bitcoin node',
    ),
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
      bitcoinMounts,
      'getnetworkinfo',
      async (subc) => {
        return await subc.execFail([
          ...bitcoinCliArgs({ prune: !!conf.prune }),
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
      bitcoinMounts,
      'getblockchaininfo',
      async (subc) => {
        return await subc.execFail([
          ...bitcoinCliArgs({ prune: !!conf.prune }),
          'getblockchaininfo',
        ])
      },
    )

    const blockchainInfoRaw: GetBlockchainInfo = JSON.parse(
      blockchainInfoRes.stdout as string,
    )

    // return
    const value = [getConnections(networkInfoRaw)]

    value.push(getBlockchainInfo(blockchainInfoRaw))

    if (blockchainInfoRaw.softforks) {
      value.push(getSoftforkInfo(blockchainInfoRaw))
    }

    return {
      version: '1',
      title: i18n('Node Runtime Info'),
      message: null,
      result: { type: 'group', value },
    }
  },
)

function getConnections(networkInfoRaw: GetNetworkInfo): T.ActionResultMember {
  return {
    type: 'single',
    name: i18n('Connections'),
    description: i18n('The number of peers connected (inbound and outbound)'),
    value: `${networkInfoRaw.connections} (${networkInfoRaw.connections_in} in / ${networkInfoRaw.connections_out} out)`,
    copyable: false,
    masked: false,
    qr: false,
  }
}

function getBlockchainInfo(
  blockchainInfoRaw: GetBlockchainInfo,
): T.ActionResultMember {
  return {
    type: 'group',
    name: i18n('Blockchain Info'),
    description: null,
    value: [
      {
        type: 'single',
        name: i18n('Block Height'),
        value: String(blockchainInfoRaw.headers),
        description: i18n('The current block height for the network'),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Synced Block Height'),
        value: String(blockchainInfoRaw.blocks),
        description: i18n('The number of blocks the node has verified'),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Sync Progress'),
        value:
          blockchainInfoRaw.blocks < blockchainInfoRaw.headers ||
          blockchainInfoRaw.blocks === 0
            ? `${(blockchainInfoRaw.verificationprogress * 100).toFixed(2)}%`
            : '100%',
        description: i18n(
          'The percentage of the blockchain that has been verified',
        ),
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
    name: i18n('Softfork Info'),
    description: null,
    value: [
      {
        type: 'group',
        name: i18n('Softforks'),
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
        name: i18n('Type'),
        value: val.type,
        description: i18n('Either "buried", "bip9"'),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Height'),
        value: val.height ? String(val.height) : 'N/A',
        description: i18n(
          'height of the first block which the rules are or will be enforced (only for "buried" type, or "bip9" type with "active" status)',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Active'),
        value: String(val.active),
        description: i18n(
          'true if the rules are enforced for the mempool and the next block',
        ),
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
    name: i18n('Bip9'),
    description: null,
    value: [
      {
        type: 'single',
        name: i18n('Status'),
        value: status,
        description: i18n(
          'One of "defined", "started", "locked_in", "active", "failed"',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Bit'),
        value: bit ? String(bit) : 'N/A',
        description: i18n(
          'The bit (0-28) in the block version field used to signal this softfork (only for "started" status)',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Start Time'),
        value: String(start_time),
        description: i18n(
          'The minimum median time past of a block at which the bit gains its meaning',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Timeout'),
        value: String(timeout),
        description: i18n(
          'The median time past of a block at which the deployment is considered failed if not yet locked in',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Since'),
        value: String(since),
        description: i18n(
          'height of the first block to which the status applies',
        ),
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
    name: i18n('Statistics'),
    description: null,
    value: [
      {
        type: 'single',
        name: i18n('Period'),
        value: String(period),
        description: i18n('The length in blocks of the BIP9 signalling period'),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Threshold'),
        value: String(threshold),
        description: i18n(
          'The number of blocks with the version bit set required to activate the feature',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Elapsed'),
        value: String(elapsed),
        description: i18n(
          'The number of blocks elapsed since the beginning of the current period',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Count'),
        value: String(count),
        description: i18n(
          'The number of blocks with the version bit set in the current period',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
      {
        type: 'single',
        name: i18n('Possible'),
        value: String(possible),
        description: i18n(
          'returns false if there are not enough blocks left in this period to pass activation threshold',
        ),
        copyable: false,
        masked: false,
        qr: false,
      },
    ],
  }
}

type Bip9 = NonNullable<GetBlockchainInfo['softforks']['']['bip9']>
type Bip9Stats = NonNullable<Bip9['statistics']>
