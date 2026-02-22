import { sdk } from './sdk'
import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import {
  GetBlockchainInfo,
  rootDir,
  ipcSocketPath,
  rpccookiefile,
  bitcoinMounts,
} from './utils'
import { rpcPort } from './utils'
import { storeJson } from './fileModels/store.json'
import { access, rm, writeFile } from 'fs/promises'
import { TOML } from '@start9labs/start-sdk'
import { i2pdConfFile } from './fileModels/i2pd.conf'
import { i18n } from './i18n'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup (optional) ========================
   */
  // get store.json but don't watch for changes
  const store = await storeJson.read().once()
  if (!store) {
    throw new Error('No store')
  }
  // get bitcoin.conf and watch for changes
  const bitcoinConf = await bitcoinConfFile.read().const(effects)
  if (!bitcoinConf) {
    throw new Error('No bticoin.conf')
  }

  // get i2pd.conf and watch for changes
  const i2pdConf = await i2pdConfFile.read().const(effects)

  const { reindexBlockchain, reindexChainstate, enableIpc } = store

  const bitcoinArgs: string[] = ['-onion=tor.startos:9050']

  if (enableIpc) {
    bitcoinArgs.push(`-ipcbind=${ipcSocketPath}`)
  }

  if (reindexBlockchain) {
    bitcoinArgs.push('-reindex')
    await storeJson.merge(effects, { reindexBlockchain: false })
  } else if (reindexChainstate) {
    bitcoinArgs.push('-reindex-chainstate')
    await storeJson.merge(effects, { reindexChainstate: false })
  }

  const bitcoindSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'bitcoind' },
    bitcoinMounts,
    'bitcoind-sub',
  )

  const rpcCookiePath = `${rootDir}/${rpccookiefile}`

  // remove cookie file
  await rm(`${bitcoindSub.rootfs}${rpcCookiePath}`, {
    force: true,
    recursive: true,
  })

  /**
   * ======================== Daemons ========================
   */

  let daemons: any = sdk.Daemons.of(effects).addOneshot('nocow', {
    subcontainer: bitcoindSub,
    exec: {
      command: ['chattr', '-R', '+C', '/.bitcoin'],
    },
    requires: [],
  })

  if (bitcoinConf.i2psam) {
    if (!i2pdConf) {
      throw new Error('No i2pd.conf')
    }

    daemons = daemons.addDaemon('i2pd', {
      subcontainer: await sdk.SubContainer.of(
        effects,
        { imageId: 'i2pd' },
        sdk.Mounts.of().mountVolume({
          volumeId: 'i2pd',
          mountpoint: '/home/i2pd',
          subpath: null,
          readonly: false,
          type: 'directory',
        }),
        'i2pd-sub',
      ),
      exec: {
        command: ['sh', '-c', 'ulimit -n 4096; /entrypoint.sh'],
        user: 'root',
      },
      ready: {
        display: 'I2P Proxy',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, 7656, {
            successMessage: 'I2P Proxy is ready',
            errorMessage: 'I2P Proxy is not ready',
          }),
      },
      requires: [],
    })
  }

  daemons = daemons
    .addDaemon('primary', {
      subcontainer: bitcoindSub,
      exec: {
        command: [
          enableIpc ? '/opt/bitcoin/libexec/bitcoin-node' : 'bitcoind',
          ...bitcoinArgs,
        ],
        sigtermTimeout: 300_000,
      },
      ready: {
        display: 'RPC',
        fn: async () => {
          try {
            await access(`${bitcoindSub.rootfs}${rpcCookiePath}`)
            const res = await bitcoindSub.exec([
              'bitcoin-cli',
              `-rpcconnect=${bitcoinConf.rpcbind}`,
              'getrpcinfo',
            ])
            return res.exitCode === 0
              ? {
                  message: i18n('The Bitcoin RPC Interface is ready'),
                  result: 'success',
                }
              : {
                  message: i18n('The Bitcoin RPC Interface is not ready'),
                  result: 'starting',
                }
          } catch {
            console.log('Waiting for cookie to be created')
            return {
              message: i18n('The Bitcoin RPC Interface is not ready'),
              result: 'starting',
            }
          }
        },
      },
      requires: ['nocow'],
    })
    .addHealthCheck('sync-progress', {
      ready: {
        display: i18n('Blockchain Sync Progress'),
        fn: async () => {
          const res = await bitcoindSub.exec([
            'bitcoin-cli',
            `-conf=${rootDir}/bitcoin.conf`,
            `-rpccookiefile=${rootDir}${rpcCookiePath}`,
            `-rpcconnect=${bitcoinConf.rpcbind}`,
            'getblockchaininfo',
          ])

          if (
            res.exitCode === 0 &&
            res.stdout !== '' &&
            typeof res.stdout === 'string'
          ) {
            const info: GetBlockchainInfo = JSON.parse(res.stdout)

            if (info.initialblockdownload) {
              const percentage = (info.verificationprogress * 100).toFixed(2)
              return {
                message: i18n('Syncing blocks...${percentage}%', {
                  percentage,
                }),
                result: 'loading',
              }
            }

            return {
              message: i18n('Bitcoin is fully synced'),
              result: 'success',
            }
          }

          if (res.stderr.includes('error code: -28')) {
            return { message: i18n('Bitcoin is starting…'), result: 'starting' }
          } else {
            return { message: res.stderr as string, result: 'failure' }
          }
        },
      },
      requires: ['primary'],
    })
    .addOneshot('synced-true', {
      subcontainer: null,
      exec: {
        fn: async () => {
          if (!store.fullySynced) {
            await storeJson.merge(effects, {
              fullySynced: true,
              snapshotInUse: false,
            })
          }

          return null
        },
      },
      requires: ['sync-progress'],
    })

  if (bitcoinConf.prune) {
    const subcontainer = await sdk.SubContainer.of(
      effects,
      { imageId: 'proxy' },
      bitcoinMounts,
      'proxy-sub',
    )

    await writeFile(
      `${subcontainer.rootfs}/config.toml`,
      TOML.stringify({
        bitcoind_address: '127.0.0.1',
        bitcoind_port: 18332,
        bind_address: '0.0.0.0',
        bind_port: rpcPort,
        cookie_file: rpcCookiePath,
        tor_proxy: 'tor.startos:9050',
        tor_only: bitcoinConf.onlynet
          ? bitcoinConf.onlynet.includes('onion')
          : false,
        passthrough_rpcauth: `${rootDir}/bitcoin.conf`,
        passthrough_rpccookie: rpcCookiePath,
      }),
    )

    return daemons.addDaemon('proxy', {
      subcontainer,
      exec: {
        command: ['/usr/bin/btc_rpc_proxy', '--conf', `/config.toml`],
      },
      ready: {
        display: i18n('RPC Proxy'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, rpcPort, {
            successMessage: i18n('The Bitcoin RPC Proxy is ready'),
            errorMessage: i18n('The Bitcoin RPC Proxy is not ready'),
          }),
      },
      requires: ['primary'],
    })
  }
  return daemons
})
