import { sdk } from './sdk'
import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import {
  GetBlockchainInfo,
  rootDir,
  ipcSocketPath,
  rpccookiefile,
  bitcoinMounts,
  i2pSamPort,
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
  console.log('Starting Bitcoin!')

  // get store.json but don't watch for changes
  const store = await storeJson.read().once()
  if (!store) {
    throw new Error('No store')
  }
  // get bitcoin.conf and watch for changes
  const bitcoinConf = await bitcoinConfFile.read().const(effects)
  if (!bitcoinConf) {
    throw new Error('No bitcoin.conf')
  }

  // get i2pd.conf and watch for changes
  const i2pdConf = await i2pdConfFile.read().const(effects)

  const { reindexBlockchain, reindexChainstate, enableIpc } = store

  // get Tor container IP and watch for changes
  const torIp = await sdk.getContainerIp(effects, { packageId: 'tor' }).const()
  const bitcoinArgs: string[] = torIp ? [`-onion=${torIp}:9050`] : []

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
   *
   * Unconditional daemons are chained synchronously on baseDaemons.
   * Conditional daemons (i2pd, proxy) use async factories that return
   * null to skip or params to include. Type assertions (as [...]) are
   * needed because async factories weaken TypeScript's contextual typing.
   */

  const i2pEnabled = !!bitcoinConf.raw?.i2psam

  const i2pMounts = sdk.Mounts.of().mountVolume({
    volumeId: 'i2pd',
    mountpoint: '/home/i2pd',
    subpath: null,
    readonly: false,
    type: 'directory',
  })

  const i2pdSub = i2pEnabled
    ? await sdk.SubContainer.of(
        effects,
        { imageId: 'i2pd' },
        i2pMounts,
        'i2pd-sub',
      )
    : null

  // ---- Build daemon chain step by step ----

  const base = sdk.Daemons.of(effects).addOneshot('nocow', {
    subcontainer: bitcoindSub,
    exec: {
      command: ['chattr', '-R', '+C', '/.bitcoin'],
    },
    requires: [],
  })

  // I2P daemon (conditional)
  const withI2pd = await base.addDaemon('i2pd', async () => {
    if (!i2pdSub) return null
    if (!i2pdConf) throw new Error('No i2pd.conf')

    // Fix volume ownership for the non-root i2pd user
    await i2pdSub.execFail(['chown', '-R', 'i2pd', '/home/i2pd'], {
      user: 'root',
    })

    return {
      subcontainer: i2pdSub,
      exec: {
        command: sdk.useEntrypoint(),
      },
      ready: {
        display: 'I2P Proxy',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, i2pSamPort, {
            successMessage: 'I2P Proxy is ready',
            errorMessage: 'I2P Proxy is not ready',
          }),
      },
      requires: [],
    }
  })

  // Bitcoind
  const withBitcoind = withI2pd
    .addDaemon('bitcoind', {
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
              `-rpccookiefile=${rpcCookiePath}`,
              '-rpcconnect=127.0.0.1',
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
      requires: i2pEnabled ? ['nocow', 'i2pd'] : ['nocow'],
    })
    .addHealthCheck('sync-progress', {
      ready: {
        display: i18n('Blockchain Sync Progress'),
        fn: async () => {
          const res = await bitcoindSub.exec([
            'bitcoin-cli',
            `-rpccookiefile=${rpcCookiePath}`,
            '-rpcconnect=127.0.0.1',
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
            return {
              message: i18n('Bitcoin is starting…'),
              result: 'starting',
            }
          } else {
            return { message: res.stderr as string, result: 'failure' }
          }
        },
      },
      requires: ['bitcoind'],
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
            // Reduce dbcache after initial sync to free RAM
            await bitcoinConfFile.merge(effects, { dbcache: 450 })
          }

          return null
        },
      },
      requires: ['sync-progress'],
    })

  const withReachability = withBitcoind.addHealthCheck('reachability', () => {
    const hasExternalIp = !!bitcoinConf.raw?.externalip
    const hasI2pIncoming =
      !!bitcoinConf.raw?.i2psam && bitcoinConf.raw?.i2pacceptincoming !== false

    if (hasExternalIp || hasI2pIncoming) return null

    return {
      ready: {
        display: i18n('Node Reachability'),
        fn: () => ({
          result: 'disabled' as const,
          message: i18n(
            'Your node can peer with other nodes, but other nodes cannot peer with you. Optionally add a Tor domain, public domain, or public IP address to change this behavior.',
          ),
        }),
      },
      requires: ['bitcoind'],
    }
  })

  // RPC proxy (conditional, enabled when pruning)
  return withReachability.addDaemon('proxy', async () => {
    if (!bitcoinConf.prune) return null

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
        tor_proxy: torIp ? `${torIp}:9050` : '',
        tor_only: bitcoinConf.onlynet
          ? bitcoinConf.onlynet.includes('onion')
          : false,
        passthrough_rpcauth: `${rootDir}/bitcoin.conf`,
        passthrough_rpccookie: rpcCookiePath,
      }),
    )

    return {
      subcontainer,
      exec: {
        command: ['/usr/bin/btc_rpc_proxy', '--conf', '/config.toml'] as [
          string,
          ...string[],
        ],
      },
      ready: {
        display: i18n('RPC Proxy'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, rpcPort, {
            successMessage: i18n('The Bitcoin RPC Proxy is ready'),
            errorMessage: i18n('The Bitcoin RPC Proxy is not ready'),
          }),
      },
      requires: ['bitcoind' as const],
    }
  })
})
