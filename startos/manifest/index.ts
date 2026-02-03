import { setupManifest } from '@start9labs/start-sdk'
import { short, long, alertUninstall, alertRestore } from './i18n'

export const manifest = setupManifest({
  id: 'bitcoind',
  title: 'Bitcoin Core',
  license: 'MIT',
  donationUrl: null,
  wrapperRepo: 'https://github.com/Start9Labs/bitcoind-startos',
  upstreamRepo: 'https://github.com/bitcoin/bitcoin',
  supportSite: 'https://github.com/bitcoin/bitcoin/issues',
  marketingSite: 'https://bitcoincore.org/',
  docsUrl:
    'https://github.com/Start9Labs/bitcoind-startos/blob/update/040/instructions.md',
  description: { short, long },
  volumes: ['main', 'i2pd'],
  images: {
    bitcoind: {
      source: {
        dockerBuild: {
          workdir: './',
          dockerfile: 'Dockerfile',
        },
      },
    },
    proxy: {
      source: {
        dockerTag: 'ghcr.io/start9labs/btc-rpc-proxy',
      },
    },
    python: {
      source: {
        dockerTag: 'python:3.13.2-alpine',
      },
    },
    i2pd: {
      source: {
        dockerTag: 'purplei2p/i2pd:release-2.58.0',
      },
    }
  },
  alerts: {
    install: null,
    update: null,
    uninstall: alertUninstall,
    restore: alertRestore,
    start: null,
    stop: null,
  },
  dependencies: {},
})
