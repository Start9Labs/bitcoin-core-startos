import { bitcoinConfFile, shape } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import { peerInterfaceId, prunedRpcallowip, prunedRpcbind } from '../utils'
import * as diskusage from 'diskusage'
import { utils } from '@start9labs/start-sdk'

const diskUsage = utils.once(() => diskusage.check('/'))

export const setDefaults = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    let defaults: Partial<typeof shape._TYPE> = {}

    // pruning
    const disk = await diskUsage()
    if (disk.total < 900_000_000_000) {
      defaults = {
        prune: 550,
        rpcbind: prunedRpcbind,
        rpcallowip: prunedRpcallowip,
      }
    }

    // externalip
    const peerInterface = await sdk.serviceInterface
      .getOwn(effects, peerInterfaceId)
      .once()
    defaults.externalip = peerInterface?.addressInfo?.onion.format()[0]

    await bitcoinConfFile.merge(effects, defaults)
  }
})
