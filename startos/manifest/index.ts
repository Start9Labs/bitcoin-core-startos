import { setupManifest } from '@start9labs/start-sdk'
import { long, short, torDescription } from './i18n'

export const manifest = setupManifest({
  id: 'bitcoind',
  title: 'Bitcoin Core',
  license: 'MIT',
  donationUrl: null,
  packageRepo: 'https://github.com/Start9Labs/bitcoin-core-startos/tree/30.x',
  upstreamRepo: 'https://github.com/bitcoin/bitcoin',
  marketingUrl: 'https://bitcoincore.org/',
  description: { short, long },
  volumes: ['main', 'i2pd'],
  images: {
    bitcoind: {
      source: {
        dockerBuild: {
          buildArgs: {
            VERSION: '30.3',
          },
        },
      },
      arch: ['x86_64', 'aarch64', 'riscv64'],
    },
    proxy: {
      source: {
        dockerTag: 'ghcr.io/start9labs/btc-rpc-proxy',
      },
      arch: ['x86_64', 'aarch64', 'riscv64'],
    },
    python: {
      source: {
        dockerTag: 'python:3.14.2-alpine',
      },
      arch: ['x86_64', 'aarch64', 'riscv64'],
    },
    i2pd: {
      source: {
        dockerTag: 'purplei2p/i2pd:release-2.58.0',
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissingAs: 'x86_64',
    },
  },
  dependencies: {
    tor: {
      description: torDescription,
      optional: true,
      metadata: {
        title: 'Tor',
        icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
      },
    },
  },
})
