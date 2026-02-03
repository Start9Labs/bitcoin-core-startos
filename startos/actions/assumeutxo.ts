import { sdk } from '../sdk'
import { rootDir } from '../utils'
import { mainMounts } from '../main'
import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { rpcPort } from '../utils'
import { Value } from '@start9labs/start-sdk/base/lib/actions/input/builder'
import * as fs from 'fs/promises'
import { SubContainer } from '@start9labs/start-sdk'
import { manifest } from '../manifest'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

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
    default: null, // @TODO update to start9 hosted and placeholder
    // @TODO add pattern for url ending in .dat
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

    assumeutxoSubc = await sdk.SubContainer.of(
      effects,
      { imageId: 'bitcoind' },
      mainMounts.mountVolume({
        volumeId: 'main',
        subpath: 'tmp',
        mountpoint: '/tmp',
        readonly: false,
      }),
      'assumeutxo',
    )

    assumeutxoPromise = (async () => {
      const conf = (await bitcoinConfFile.read().once())!

      try {
        await fs.mkdir(`${assumeutxoSubc.rootfs}/tmp/snap`, { recursive: true })
        await fs.rm(`${assumeutxoSubc.rootfs}${snapshotTempFile}`, {
          force: true,
        })

        await assumeutxoSubc.execFail(
          ['wget', '-O', snapshotTempFile, input.snapshotUrl.trim()],
          {},
          null,
        )

        do {
          const getBlockHeaderRes = await assumeutxoSubc.exec([
            'bitcoin-cli',
            `-conf=${rootDir}/bitcoin.conf`,
            `-rpccookiefile=${rootDir}/.cookie`,
            `-rpcport=${conf.prune ? 18332 : rpcPort}`,
            'getblockheader',
            block_840_000,
          ])
          if (getBlockHeaderRes.exitCode !== 0) {
            await new Promise((resolve) => setTimeout(resolve, 10_000))
            continue
          }
          break
        } while (true)

        await assumeutxoSubc.execFail(
          [
            'bitcoin-cli',
            `-conf=${rootDir}/bitcoin.conf`,
            `-rpccookiefile=${rootDir}/.cookie`,
            `-rpcport=${conf.prune ? 18332 : rpcPort}`,
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
          reason: 'Previous attempt to download Snapshot failed.',
        })
      } finally {
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
