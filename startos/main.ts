import { TOML } from '@start9labs/start-sdk'
import { access, rm, writeFile } from 'fs/promises'
import { request } from 'node:https'
import { socksHostId, socksPort } from 'tor-startos/startos/utils'
import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import { i2pdConfFile } from './fileModels/i2pd.conf'
import { storeJson } from './fileModels/store.json'
import { reconsiderInvalidTips } from './forkRecovery'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  bitcoinCliArgs,
  bitcoinMounts,
  GetBlockchainInfo,
  i2pControlPort,
  rootDir,
  rpccookiefile,
  rpcPort,
  rpcPortPruned,
} from './utils'

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

  const { reindexBlockchain, reindexChainstate } = store

  // Tor SOCKS over the bridge. The bridge address only changes when tor's
  // binding does — with the 9050 fallback it stays constant across tor
  // install/update/uninstall, so this .const() never restarts Bitcoin unless
  // tor lands on a different port (then one healing restart). A dead bridge
  // address is just connection-refused, so -onion is always safe to pass.
  const torSocks = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'tor',
      hostId: socksHostId,
      internalPort: socksPort,
      fallbackPort: socksPort,
    })
    .const()

  // track Tor install/run state dynamically for the health check (no restart)
  let torInstalled = false
  let torRunning = false
  sdk.getStatus(effects, { packageId: 'tor' }).onChange((status) => {
    torInstalled = status !== null
    torRunning = status?.desired.main === 'running'
    return { cancel: false }
  })

  const bitcoinArgs: string[] = [`-onion=${torSocks}`]

  if (reindexBlockchain) {
    bitcoinArgs.push('-reindex')
    await storeJson.merge(effects, { reindexBlockchain: false })
  } else if (reindexChainstate) {
    bitcoinArgs.push('-reindex-chainstate')
    await storeJson.merge(effects, { reindexChainstate: false })
  }

  const bitcoindSub = await sdk.SubContainer.eager(
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
    ? await sdk.SubContainer.eager(
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
        command: ['chattr', '-R', '+C', rootDir],
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
        command: ['bitcoind', ...bitcoinArgs],
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
            // Keep the in-memory guard in sync so a sync-progress dip and
            // recovery within this run doesn't re-fire the notification.
            store.fullySynced = true
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
    /**
     * Chain-split recovery (see forkRecovery.ts). Consumes the store flag
     * set by cross-flavor migrations. This flavor never enforces RDTS
     * (BIP-110), so only the "leaving the enforcing flavor" half applies:
     * record the durable rdtsEnforcedLastRun=false marker each start and
     * clear invalid-block verdicts inherited from the RDTS-enforcing
     * flavor. The opposite direction needs nothing from the package — the
     * enforcing flavor's own binary re-validates on arrival.
     * Runs once per start as soon as RPC answers; nothing depends on it, so
     * it never blocks the service.
     */
    .addOneshot('chain-recovery', {
      subcontainer: null,
      exec: {
        fn: async () => {
          const prune = !!bitcoinConf.prune

          // Materialize an enforcement-regime transition into the durable
          // recovery flag BEFORE updating the marker, so a crash between
          // the writes re-detects the transition instead of losing it.
          // Enforcement is constant false in this flavor, so only the
          // on→off transition can appear here — and an UNKNOWN marker
          // (legacy datadir, e.g. one last advanced by a published
          // enforcing-Knots package version that predates the marker) is
          // treated as "may have enforced": the reconsider pass is a free
          // no-op when there are no invalid tips. The in-memory `store`
          // mirrors every merge so a bitcoind health-flap re-running this
          // oneshot within one main run doesn't repeat completed work.
          let wantReconsider = store.reconsiderInvalidTips
          if (store.rdtsEnforcedLastRun !== false) {
            wantReconsider = true
            store.reconsiderInvalidTips = true
            await storeJson.merge(effects, { reconsiderInvalidTips: true })
            store.rdtsEnforcedLastRun = false
            await storeJson.merge(effects, { rdtsEnforcedLastRun: false })
          }

          if (wantReconsider) {
            try {
              const res = await reconsiderInvalidTips(bitcoindSub, { prune })
              store.reconsiderInvalidTips = false
              await storeJson.merge(effects, {
                reconsiderInvalidTips: false,
              })
              if (res.reconsidered.length) {
                await sdk.notification.create(effects, {
                  level: 'info',
                  title: i18n('Chain Verdicts Reset'),
                  message: i18n(
                    "Cleared invalid-block verdicts inherited from the previously installed bitcoind flavor on ${count} chain tip(s). The node now follows the best chain that is valid under this flavor's rules; reorganizing onto it may take a while and requires peers on that chain.",
                    { count: String(res.reconsidered.length) },
                  ),
                })
              }
              if (res.skippedPruned.length) {
                await sdk.notification.create(effects, {
                  level: 'warning',
                  title: i18n('Some Chains Not Recoverable'),
                  message: i18n(
                    '${count} invalid chain branch(es) inherited from the previous bitcoind flavor could not be reconsidered: this pruned node no longer stores the blocks needed to reorganize onto them. If the node appears stuck on the wrong chain, run Reindex Blockchain (on a pruned node this re-downloads the chain).',
                    { count: String(res.skippedPruned.length) },
                  ),
                })
              }
            } catch (e) {
              console.error('chain-recovery: reconsider failed', e)
              await sdk.notification.create(effects, {
                level: 'error',
                title: i18n('Chain Recovery Failed'),
                message: i18n(
                  'Clearing invalid-block verdicts inherited from the previous bitcoind flavor failed; it will be retried at the next restart. Error: ${error}',
                  { error: String(e) },
                ),
              })
            }
          }

          return null
        },
      },
      requires: ['bitcoind'],
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
          // A router that can never bootstrap used to be indistinguishable
          // from one still starting: every branch below returned a bare
          // `starting` with no message, forever. Past the grace period the
          // states that will not resolve on their own now report `failure`
          // and say what is wrong.
          gracePeriod: 5 * 60 * 1000,
          fn: async () => {
            try {
              // i2pd never validates the I2PControl token (PurpleI2P/i2pd#2138)
              // and logs an error for `Token` as an unknown RouterInfo field.
              const info = await i2pControlRpc('RouterInfo', {
                'i2p.router.net.status': null,
                'i2p.router.netdb.knownpeers': null,
                'i2p.router.netdb.activepeers': null,
              })
              const netStatus = info?.result?.['i2p.router.net.status']
              const knownPeers = info?.result?.['i2p.router.netdb.knownpeers']
              const activePeers = info?.result?.['i2p.router.netdb.activepeers']

              // An empty netDb means reseed never landed — the router has
              // nothing to connect to and will not recover on its own. It
              // reseeds over HTTPS by hostname, so the usual cause is that
              // the server cannot resolve names at all.
              if (knownPeers <= 1) {
                return {
                  result: 'failure' as const,
                  message: i18n(
                    'No peers found. The router could not reach a reseed server, which usually means this server cannot resolve DNS. Check System > DNS Servers.',
                  ),
                }
              }

              // net.status 0-7 are operational (OK, testing, firewalled, hidden, warnings)
              // net.status 8+ are errors (I2CP, clock skew, no peers, etc.)
              if (netStatus >= 8) {
                return {
                  result: 'failure' as const,
                  message: i18n(
                    'The I2P router reported error status ${status}',
                    {
                      status: String(netStatus),
                    },
                  ),
                }
              }

              // Reseeded, but no tunnels yet — this one does resolve itself.
              if (activePeers === 0) {
                return {
                  result: 'starting' as const,
                  message: i18n('Building the network database'),
                }
              }

              return {
                result: 'success' as const,
                message:
                  bitcoinConf.raw?.i2pacceptincoming !== false
                    ? i18n('Inbound and outbound connections')
                    : i18n('Outbound connections only'),
              }
            } catch {
              return {
                result: 'starting' as const,
                message: i18n('Starting the I2P router'),
              }
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
        if (!torInstalled) {
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

    const subcontainer = await sdk.SubContainer.eager(
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
        tor_proxy: torSocks,
        tor_only: onlynetList.length === 1 && onlynetList[0] === 'onion',
        // Users derived from the two passthrough sources carry no explicit
        // fetch_blocks, so this global switch is what grants them on-demand
        // fetching of pruned blocks over p2p. Without it the proxy forwards
        // every getblock straight to bitcoind.
        default_fetch_blocks: true,
        // Unset, the proxy asks every eligible peer for the same block at once
        // and keeps the first valid answer — N copies of every fetch.
        max_peer_concurrency: 3,
        // Peers reachable only over I2P need i2pd's SOCKS proxy; the fetcher
        // reaches clearnet and .onion peers on its own.
        ...(runI2pd && i2pdConf?.socksproxy.enabled
          ? { i2p_proxy: `127.0.0.1:${i2pdConf.socksproxy.port}` }
          : {}),
        passthrough_rpcauth: `${rootDir}/bitcoin.conf`,
        passthrough_rpccookie: rpcCookiePath,
      }),
    )

    return {
      subcontainer,
      exec: {
        // The verbosity counter starts at Critical, a level the proxy has no
        // call sites for, so unraised it cannot report a failure at all.
        command: [
          '/usr/bin/btc_rpc_proxy',
          '--conf',
          '/config.toml',
          '-vv',
        ] as [string, ...string[]],
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
