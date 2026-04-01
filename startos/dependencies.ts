import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const { externalip, onlynet } =
    (await bitcoinConfFile
      .read((b) => ({ externalip: b.raw?.externalip, onlynet: b.onlynet }))
      .const(effects)) ?? {}

  const onlynetList = [onlynet ?? []].flat()

  if (externalip?.some((ip) => ip?.includes('.onion')) || onlynetList.includes('onion')) {
    return {
      tor: {
        kind: 'running',
        versionRange: '>=0.4.9.5:0',
        healthChecks: [],
      },
    }
  }

  return {}
})
