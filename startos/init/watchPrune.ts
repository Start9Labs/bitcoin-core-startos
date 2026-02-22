import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import { rpcallowip, rpcallowipPruned, rpcbind, rpcbindPruned } from '../utils'

export const watchPrune = sdk.setupOnInit(async (effects, _) => {
  const prune = await bitcoinConfFile.read((c) => c.prune).const(effects)

  await bitcoinConfFile.merge(
    effects,
    {
      rpcbind: prune ? rpcbindPruned : rpcbind,
      rpcallowip: prune ? rpcallowipPruned : rpcallowip,
    },
    { allowWriteAfterConst: true },
  )
})
