import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { bitcoinConfDefaults, rpcallowipPruned, rpcbindPruned } from '../utils'
import * as diskusage from 'diskusage'
import { utils } from '@start9labs/start-sdk'
import { i2pdConfFile } from '../fileModels/i2pd.conf'
import { inboundConnections } from '../actions/config/inboundConnections'
import { i18n } from '../i18n'

const diskUsage = utils.once(() => diskusage.check('/'))

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {})

  await bitcoinConfFile.merge(effects, {
    raw: {
      ...bitcoinConfDefaults,
      ...((await diskUsage()).total < 900_000_000_000
        ? {
            prune: 550,
            rpcbind: rpcbindPruned,
            rpcallowip: rpcallowipPruned,
          }
        : {}),
    },
  })

  await i2pdConfFile.merge(effects, {})

  await sdk.action.createOwnTask(effects, inboundConnections, 'critical', {
    reason: i18n(
      'Configure how your node is reachable by peers. You can allow inbound connections via a public address or Tor, or disable them entirely.',
    ),
  })
})
