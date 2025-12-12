import { sdk } from './sdk'
import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import {
  bitcoinConfDefaults,
  GetBlockchainInfo,
  rootDir,
  ipcSocketPath,
} from './utils'
import { rpcPort } from './utils'
import { storeJson } from './fileModels/store.json'
import { access, rm, writeFile } from 'fs/promises'
import { TOML } from '@start9labs/start-sdk'

export const mainMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: rootDir,
  readonly: false,
})

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   */
  const osIp = await sdk.getOsIp(effects)

  const bitcoinArgs: string[] = []

  bitcoinArgs.push(`-onion=${osIp}:9050`)

  const { reindexBlockchain, reindexChainstate } = (await storeJson
    .read()
    .once()) || { reindexBlockchain: false, reindexChainstate: false }

  if (reindexBlockchain) {
    bitcoinArgs.push('-reindex')
    await storeJson.merge(effects, { reindexBlockchain: false })
  } else if (reindexChainstate) {
    bitcoinArgs.push('-reindex-chainstate')
    await storeJson.merge(effects, { reindexChainstate: false })
  }

  const conf = await bitcoinConfFile.read().const(effects)
  if (!conf) {
    throw new Error('bticoin.conf not found')
  }

  // Add IPC binding if enabled
  const store = await storeJson.read().once()
  const enableIpc = store?.enableIpc === true // Default to false if not set

  // Use bitcoin-node for IPC support (in libexec), bitcoind otherwise
  const daemonBinary = enableIpc
    ? '/opt/bitcoin/libexec/bitcoin-node'
    : 'bitcoind'

  // Add IPC argument if enabled (bitcoin-node will create parent directories)
  if (enableIpc) {
    bitcoinArgs.push(`-ipcbind=${ipcSocketPath}`)
  }

  const bitcoindSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'bitcoind' },
    mainMounts,
    'bitcoind-sub',
  )

  /**
   * ======================== Daemons ========================
   */

  const rpcCookieFile = `${rootDir}/${bitcoinConfDefaults.rpccookiefile}`

  await rm(`${bitcoindSub.rootfs}/${rpcCookieFile}`, { force: true })

  const daemons = sdk.Daemons.of(effects, started)
    .addDaemon('primary', {
      subcontainer: bitcoindSub,
      exec: {
        command: [daemonBinary, ...bitcoinArgs],
        sigtermTimeout: 300_000,
      },
      ready: {
        display: 'RPC',
        fn: async () => {
          try {
            await access(`${bitcoindSub.rootfs}${rpcCookieFile}`)
            const res = await bitcoindSub.exec([
              'bitcoin-cli',
              `-rpcconnect=${conf.rpcbind}`,
              'getrpcinfo',
            ])
            return res.exitCode === 0
              ? {
                  message: 'The Bitcoin RPC Interface is ready',
                  result: 'success',
                }
              : {
                  message: 'The Bitcoin RPC Interface is not ready',
                  result: 'starting',
                }
          } catch {
            console.log('Waiting for cookie to be created')
            return {
              message: 'The Bitcoin RPC Interface is not ready',
              result: 'starting',
            }
          }
        },
      },
      requires: [],
    })
    .addHealthCheck('sync-progress', {
      ready: {
        display: 'Blockchain Sync Progress',
        fn: async () => {
          const res = await bitcoindSub.exec([
            'bitcoin-cli',
            `-conf=${rootDir}/bitcoin.conf`,
            `-rpccookiefile=${rootDir}/${bitcoinConfDefaults.rpccookiefile}`,
            `-rpcconnect=${conf.rpcbind}`,
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
                message: `Syncing blocks...${percentage}%`,
                result: 'loading',
              }
            }

            return { message: 'Bitcoin is fully synced', result: 'success' }
          }

          if (res.stderr.includes('error code: -28')) {
            return { message: 'Bitcoin is starting…', result: 'starting' }
          } else {
            return { message: res.stderr as string, result: 'failure' }
          }
        },
      },
      requires: ['primary'],
    })
    .addOneshot('synced-true', {
      requires: ['sync-progress'],
      subcontainer: null,
      exec: {
        fn: async () => {
          const store = await storeJson.read().once()
          if (!store) return null

          const fullySynced = store.fullySynced

          if (!fullySynced) {
            await storeJson.merge(effects, {
              fullySynced: true,
              snapshotInUse: false,
            })
          }

          return null
        },
      },
    })

  if (conf.prune) {
    const subcontainer = await sdk.SubContainer.of(
      effects,
      { imageId: 'proxy' },
      mainMounts,
      'proxy-sub',
    )

    await writeFile(
      `${subcontainer.rootfs}/config.toml`,
      TOML.stringify({
        bitcoind_address: '127.0.0.1',
        bitcoind_port: 18332,
        bind_address: '0.0.0.0',
        bind_port: rpcPort,
        cookie_file: `${rootDir}/${bitcoinConfDefaults.rpccookiefile}`,
        tor_proxy: `${osIp}:9050`,
        tor_only: conf.onlynet ? conf.onlynet.includes('onion') : false,
        passthrough_rpcauth: `${rootDir}/bitcoin.conf`,
        passthrough_rpccookie: `${rootDir}/${bitcoinConfDefaults.rpccookiefile}`,
      }),
    )

    return daemons.addDaemon('proxy', {
      subcontainer,
      exec: {
        command: ['/usr/bin/btc_rpc_proxy', '--conf', `/config.toml`],
      },
      ready: {
        display: 'RPC Proxy',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, rpcPort, {
            successMessage: 'The Bitcoin RPC Proxy is ready',
            errorMessage: 'The Bitcoin RPC Proxy is not ready',
          }),
      },
      requires: ['primary'],
    })
  }
  return daemons
})
