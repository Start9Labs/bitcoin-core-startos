import { sdk } from '../sdk'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { bitcoinCliArgs, bitcoinMounts, rootDir } from '../utils'
import * as fs from 'fs/promises'
import { SubContainer } from '@start9labs/start-sdk'
import { manifest } from '../manifest'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
const { Value } = sdk

export const snapshotTempFile = `/tmp/snap/snapshot`
const block_840_000 =
  '0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5'

let assumeutxoSubc: SubContainer<typeof manifest> | null = null
let assumeutxoPromise: Promise<void> | null = null
let retriggerActionMetadata: (() => void) | undefined

const assumeutxoInputSpec = sdk.InputSpec.of({
  snapshotUrl: Value.text({
    name: i18n('UTXO Snapshot URL'),
    description: i18n('URL of UTXO Snapshot to bootstrap bitcoin'),
    required: true,
    default: null, // @TODO default to a Start9-hosted snapshot once one exists
    placeholder: 'https://example.com/utxo-840000.dat',
    inputmode: 'url',
    patterns: [
      {
        regex: '^https?://\\S+\\.dat(\\?\\S*)?$',
        description: i18n('Must be an http(s) URL ending in .dat'),
      },
    ],
  }),
})

export const assumeutxo = sdk.Action.withInput(
  // id
  'assumeutxo',

  // metadata
  async ({ effects }) => {
    retriggerActionMetadata = effects.constRetry
    const { snapshotInUse, fullySynced } = (await storeJson
      .read()
      .const(effects)) || {
      snapshotInUse: false,
      fullySynced: false,
    }
    return {
      name: i18n('Download UTXO Snapshot (assumeutxo)'),
      description: i18n(
        'assumeutxo is a feature that allows fast bootstrapping of a validating bitcoind instance. It may take some additional time for any blocks between the snapshot blockheight and the tip to be downloaded and validated. While the snapshot is in use the IBD will continue in the background until it validates up to the snapshot blockheight',
      ),
      warning: i18n(
        "While any downloaded snapshot will be checked against a hash that's been hardcoded in source code, this action will download anything at the provided URL to the server - Only download from trusted sources!",
      ),
      allowedStatuses: 'only-running',
      group: null,
      visibility: assumeutxoPromise
        ? { disabled: i18n('Download in progress...') }
        : snapshotInUse
          ? { disabled: i18n('Snapshot in use') }
          : fullySynced
            ? 'hidden'
            : 'enabled',
    }
  },

  assumeutxoInputSpec,

  async ({ effects }) => {},

  // execution function
  async ({ effects, input }) => {
    if (assumeutxoSubc || assumeutxoPromise)
      throw new Error('already in progress')

    assumeutxoSubc = await sdk.SubContainer.eager(
      effects,
      { imageId: 'bitcoind' },
      bitcoinMounts.mountVolume({
        volumeId: 'main',
        subpath: 'tmp',
        mountpoint: '/tmp',
        readonly: false,
      }),
      'assumeutxo',
    )

    assumeutxoPromise = (async () => {
      const rootfs = await assumeutxoSubc.rootfs

      try {
        const conf = (await bitcoinConfFile.read().once())!
        await fs.mkdir(`${rootfs}/tmp/snap`, { recursive: true })
        await fs.rm(`${rootfs}${snapshotTempFile}`, {
          force: true,
        })

        // No overall timeout — a full snapshot legitimately takes hours — so
        // the speed floor is what bounds a wedged transfer.
        await assumeutxoSubc.execFail(
          [
            'curl',
            '-fsSL',
            '--connect-timeout',
            '30',
            '--speed-limit',
            '1024',
            '--speed-time',
            '120',
            '--retry',
            '5',
            '--retry-delay',
            '10',
            '--continue-at',
            '-',
            '-o',
            snapshotTempFile,
            input.snapshotUrl.trim(),
          ],
          {},
          null,
        )

        const headersDeadline = Date.now() + 6 * 60 * 60 * 1000
        do {
          const getBlockHeaderRes = await assumeutxoSubc.exec([
            ...bitcoinCliArgs({ prune: !!conf.prune }),
            'getblockheader',
            block_840_000,
          ])
          if (getBlockHeaderRes.exitCode !== 0) {
            if (Date.now() > headersDeadline)
              throw new Error(
                `headers never reached the snapshot height: ${String(getBlockHeaderRes.stderr)}`,
              )
            await new Promise((resolve) => setTimeout(resolve, 10_000))
            continue
          }
          break
        } while (true)

        await assumeutxoSubc.execFail(
          [
            ...bitcoinCliArgs({ prune: !!conf.prune }),
            '-rpcclienttimeout=0',
            'loadtxoutset',
            `${rootDir}/${snapshotTempFile}`,
          ],
          {},
          null,
        )
        await storeJson.merge(effects, { snapshotInUse: true })
      } catch (e) {
        console.log('Error downloading snapshot:\n', e)
        await sdk.action.createOwnTask(effects, assumeutxo, 'important', {
          reason: i18n(
            'Previous attempt to download Snapshot failed: ${error}',
            {
              error: e instanceof Error ? e.message : String(e),
            },
          ),
        })
      } finally {
        // loadtxoutset consumes the snapshot, and a failed attempt re-downloads
        // from scratch, so nothing here is worth the disk it occupies.
        await fs
          .rm(`${rootfs}/tmp/snap`, { recursive: true, force: true })
          .catch(console.error)
        await assumeutxoSubc.destroy()
        assumeutxoSubc = null
        assumeutxoPromise = null
        retriggerActionMetadata?.()
      }
    })()

    retriggerActionMetadata?.()

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n(
        'Snapshot download in progress. Upon successful download the snapshot will be loaded as the active chainstate and any blocks between the snapshot blockheight and tip will be downloaded and verified. Blocks from genesis to the snapshot blockheight will continue to be verfied in the background. Once the IBD catches up to the snapshot height the chain will have been fully validated',
      ),
      result: null,
    }
  },
)
