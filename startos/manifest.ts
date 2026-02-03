import { setupManifest } from '@start9labs/start-sdk'

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
  description: {
    short: 'A Bitcoin Full Node by Bitcoin Core',
    long: 'Bitcoin is an innovative payment network and a new kind of money. Bitcoin uses peer-to-peer technology to operate with no central authority or banks; managing transactions and the issuing of bitcoins is carried out collectively by the network. Bitcoin is open-source; its design is public, nobody owns or controls Bitcoin and everyone can take part. Through many of its unique properties, Bitcoin allows exciting uses that could not be covered by any previous payment system.',
  },
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
    uninstall:
      "Uninstalling Bitcoin Core will result in permanent loss of data. Without a backup, any funds stored on your node's default hot wallet will be lost forever. If you are unsure, we recommend making a backup, just to be safe.",
    restore:
      'Restoring Bitcoin Core will overwrite its current data. You will lose any transactions recorded in watch-only wallets, and any funds you have received to the hot wallet, since the last backup.',
    start: null,
    stop: null,
  },
  dependencies: {},
})
