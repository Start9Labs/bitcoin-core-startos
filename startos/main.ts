import { TOML } from '@start9labs/start-sdk'
import { access, rm, writeFile } from 'fs/promises'
import { request } from 'node:https'
import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import { i2pdConfFile } from './fileModels/i2pd.conf'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  bitcoinCliArgs,
  bitcoinMounts,
  GetBlockchainInfo,
  i2pControlPort,
  ipcSocketPath,
  rootDir,
  rpccookiefile,
  rpcPort,
  rpcPortPruned,
} from './utils'

const ipcSocketFile = `${rootDir}/ipc/bitcoin-core.sock`

// JSON-RPC helper for i2pd's I2PControl API (uses self-signed cert)
const i2pControlRpc = (method: string, params: Record<string, unknown>) =>
  new Promise<any>((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
    const req = request(
      {
        hostname: '127.0.0.1',
        port: i2pControlPort,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk: string) => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch {
            reject(new Error('Invalid JSON'))
          }
        })
      },
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })

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

  // get Tor container IP (restarts Bitcoin if IP changes, needed for -onion= flag)
  const torIp = await sdk.getContainerIp(effects, { packageId: 'tor' }).const()

  // track Tor running status dynamically for health check (no restart needed)
  let torRunning = false
  if (torIp) {
    sdk.getStatus(effects, { packageId: 'tor' }).onChange((status) => {
      torRunning = status?.desired.main === 'running'
      return { cancel: false }
    })
  }

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
  const externalip = bitcoinConf.raw?.externalip
  const onlynetList = [bitcoinConf.onlynet ?? []].flat()
  const onlynetActive = onlynetList.length > 0
  const excludedByOnlynetResult = () => ({
    result: 'disabled' as const,
    message: i18n('Excluded by onlynet'),
  })

  const runI2pd = i2pEnabled && (!onlynetActive || onlynetList.includes('i2p'))

  const i2pdSub = runI2pd
    ? await sdk.SubContainer.of(
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
      )
    : null

  // ---- Build daemon chain step by step ----

  const base = sdk.Daemons.of(effects)
    .addOneshot('nocow', {
      subcontainer: bitcoindSub,
      exec: {
        command: [
          'sh',
          '-c',
          `rm -f ${ipcSocketFile}; find ${rootDir} \\( -type d -o -type f \\) -exec chattr +C {} +`,
        ],
      },
      requires: [],
    })
    .addOneshot('clean-chainstate-old', {
      subcontainer: bitcoindSub,
      exec: {
        command: [
          'sh',
          '-c',
          `rm -rf ${rootDir}/chainstate.old ${rootDir}/*/chainstate.old`,
        ],
      },
      requires: [],
    })

  const withBitcoind = await base
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
          } catch {
            console.log('Waiting for cookie to be created')
            return {
              message: i18n('The Bitcoin RPC Interface is not ready'),
              result: 'starting',
            }
          }

          return sdk.healthCheck.checkPortListening(
            effects,
            bitcoinConf.prune ? rpcPortPruned : rpcPort,
            {
              successMessage: i18n('The Bitcoin RPC Interface is ready'),
              errorMessage: i18n('The Bitcoin RPC Interface is not ready'),
            },
          )
        },
      },
      requires: ['nocow', 'clean-chainstate-old'],
    })
    .addHealthCheck('sync-progress', {
      ready: {
        display: i18n('Blockchain Sync'),
        trigger: sdk.trigger.statusTrigger(30_000, {
          starting: 5_000,
          failure: 5_000,
        }),
        fn: async () => {
          const res = await bitcoindSub.exec([
            ...bitcoinCliArgs({ prune: !!bitcoinConf.prune }),
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

          return {
            message: i18n('Bitcoin is starting…'),
            result: 'starting',
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
            await sdk.notification.create(effects, {
              level: 'success',
              title: i18n('Sync Complete'),
              message: i18n('The blockchain is fully synced.'),
            })
            await storeJson.merge(effects, {
              fullySynced: true,
              snapshotInUse: false,
            })
            // Reduce dbcache and dbbatchsize after initial sync to free RAM
            await bitcoinConfFile.merge(effects, {
              dbcache: undefined,
              dbbatchsize: undefined,
            })
          }

          return null
        },
      },
      requires: ['sync-progress'],
    })
    // I2P daemon (conditional)
    .addDaemon('i2pd', async () => {
      if (!i2pdSub) return null
      if (!i2pdConf) throw new Error('No i2pd.conf')

      // Entrypoint runs `ln -s` for certificates, which fails on restarts
      // when the symlink persists on the volume
      await i2pdSub.execFail(['rm', '-rf', '/home/i2pd/data/certificates'], {
        user: 'root',
      })
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
          display: 'I2P',
          fn: async () => {
            try {
              const auth = await i2pControlRpc('Authenticate', {
                API: 1,
                Password: 'itoopie',
              })
              const token = auth?.result?.Token
              if (!token) {
                return { result: 'starting' as const, message: '' }
              }

              const info = await i2pControlRpc('RouterInfo', {
                Token: token,
                'i2p.router.net.status': null,
                'i2p.router.netdb.activepeers': null,
              })
              const netStatus = info?.result?.['i2p.router.net.status']
              const activePeers = info?.result?.['i2p.router.netdb.activepeers']

              // net.status 0-7 are operational (OK, testing, firewalled, hidden, warnings)
              // net.status 8+ are errors (I2CP, clock skew, no peers, etc.)
              if (netStatus >= 8 || activePeers === 0) {
                return { result: 'starting' as const, message: '' }
              }

              return {
                result: 'success' as const,
                message:
                  bitcoinConf.raw?.i2pacceptincoming !== false
                    ? i18n('Inbound and outbound connections')
                    : i18n('Outbound connections only'),
              }
            } catch {
              return { result: 'starting' as const, message: '' }
            }
          },
        },
        requires: [],
      }
    })

  const withI2p = runI2pd
    ? withBitcoind
    : withBitcoind.addHealthCheck('i2p', {
        ready: {
          display: 'I2P',
          fn: () =>
            i2pEnabled
              ? excludedByOnlynetResult()
              : {
                  result: 'disabled' as const,
                  message: i18n('I2P is disabled'),
                },
        },
        requires: [],
      })

  const withTor = withI2p.addHealthCheck('tor', {
    ready: {
      display: 'Tor',
      fn: () => {
        if (!torIp) {
          return { result: 'disabled', message: i18n('Tor is not installed') }
        }
        if (!torRunning) {
          return { result: 'disabled', message: i18n('Tor is not running') }
        }
        if (onlynetActive && !onlynetList.includes('onion')) {
          return excludedByOnlynetResult()
        }
        return {
          result: 'success',
          message: externalip?.some((ip) => ip?.includes('.onion'))
            ? i18n('Inbound and outbound connections')
            : i18n('Outbound only. Add an onion address to enable inbound.'),
        }
      },
    },
    requires: [],
  })

  const withClearnet = withTor.addHealthCheck('clearnet', {
    ready: {
      display: 'Clearnet',
      fn: () => {
        if (
          onlynetActive &&
          !onlynetList.includes('ipv4') &&
          !onlynetList.includes('ipv6')
        ) {
          return excludedByOnlynetResult()
        }
        return {
          result: 'success',
          message: externalip?.some((ip) => ip && !ip.includes('.onion'))
            ? i18n('Inbound and outbound connections')
            : i18n('Outbound only. Publish an IP address to enable inbound.'),
        }
      },
    },
    requires: [],
  })

  // RPC proxy (conditional, enabled when pruning)
  return withClearnet.addDaemon('proxy', async () => {
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
        bitcoind_port: rpcPortPruned,
        bind_address: '0.0.0.0',
        bind_port: rpcPort,
        cookie_file: rpcCookiePath,
        ...(torIp
          ? {
              tor_proxy: `${torIp}:9050`,
              tor_only: onlynetList.length === 1 && onlynetList[0] === 'onion',
            }
          : {}),
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
