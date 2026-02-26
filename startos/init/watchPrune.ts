import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'

export const watchPrune = sdk.setupOnInit(async (effects, _) => {
  const prune = await bitcoinConfFile.read((c) => c.prune).const(effects)

  await bitcoinConfFile.merge(
    effects,
    { prune },
    { allowWriteAfterConst: true },
  )
})
