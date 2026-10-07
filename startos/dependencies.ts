import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import { torDescription } from './manifest/i18n'
import { sdk } from './sdk'

const tor = sdk.Dependency.optional('tor', {
  description: torDescription,
  metadata: {
    title: 'Tor',
    icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
  },
  kind: 'running',
  versionRange: '>=0.4.9.11:4',
  healthChecks: [],
  enabled: async ({ effects }) => {
    const { externalip, onlynet } =
      (await bitcoinConfFile
        .read((b) => ({ externalip: b.raw?.externalip, onlynet: b.onlynet }))
        .const(effects)) ?? {}
    return !!(
      externalip?.some((ip) => ip?.includes('.onion')) ||
      [onlynet ?? []].flat().includes('onion')
    )
  },
})

export const dependencies = sdk.Dependencies.of().addDependency(tor)
