import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import { i2pdConfFile } from './fileModels/i2pd.conf'
import { sdk } from './sdk'
import {
  i2pConsoleHostId,
  i2pUiPort,
  peerHostId,
  peerInterfaceId,
  peerLocalHostId,
  peerPortExternal,
  peerPortInternal,
  peerPortLocal,
  rpcHostId,
  rpcInterfaceId,
  rpcPort,
  zmqBlockInterfaceId,
  zmqHostId,
  zmqTxInterfaceId,
  zmqPortBlock,
  zmqPortTransaction,
} from './utils'
import { i18n } from './i18n'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // Only the ZMQ and I2P exports read this file, so RPC and peer must not
  // vanish with it, and an absent conf is a gap rather than a removal.
  const bitcoinConf = await bitcoinConfFile
    .read(
      (conf) => conf,
      (prev, next) => next === null || prev === next,
    )
    .const(effects)

  // RPC
  const rpcMulti = sdk.MultiHost.of(effects, rpcHostId)
  const rpcMultiOrigin = await rpcMulti.bindPort(rpcPort, {
    protocol: 'http',
    preferredExternalPort: rpcPort,
  })
  const rpc = sdk.createInterface(effects, {
    name: i18n('RPC'),
    id: rpcInterfaceId,
    description: i18n('Listens for JSON-RPC commands'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const rpcReceipt = await rpcMultiOrigin.export([rpc])

  const receipts = [rpcReceipt]

  // Peer
  const peerMulti = sdk.MultiHost.of(effects, peerHostId)
  const peerMultiOrigin = await peerMulti.bindPort(peerPortInternal, {
    protocol: null,
    preferredExternalPort: peerPortExternal,
    addSsl: null,
    secure: { ssl: false },
  })
  const peer = sdk.createInterface(effects, {
    name: i18n('Peer'),
    id: peerInterfaceId,
    description: i18n(
      'Listens for incoming connections from peers on the bitcoin network',
    ),
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: null, noSsl: null },
    username: null,
    path: '',
    query: {},
  })
  const peerReceipt = await peerMultiOrigin.export([peer])

  receipts.push(peerReceipt)

  // Whitelisted p2p for services on the bridge. bitcoind whitebinds this port,
  // so a peer arriving on it gets noban + download + mempool — which a
  // dependent that pulls historical blocks needs to avoid inbound eviction and
  // the upload-target cutoff. No exported interface: an unexported binding
  // stays off the LAN and lands only on lo/lxcbr0, so a public peer can't reach
  // the permissions and keeps arriving on `peer`'s plain `bind`.
  await sdk.MultiHost.of(effects, peerLocalHostId).bindPort(peerPortLocal, {
    protocol: null,
    preferredExternalPort: peerPortLocal,
    addSsl: null,
    secure: { ssl: false },
  })

  // ZMQ (conditional). Block (28332) and transaction (28333) are exposed as
  // separate interfaces so a dependent (e.g. LND) can resolve each one's bridge
  // address independently — bitcoind publishes the two on distinct ports.
  if (bitcoinConf?.zmqEnabled) {
    const zmqMulti = sdk.MultiHost.of(effects, zmqHostId)

    const zmqBlockOrigin = await zmqMulti.bindPort(zmqPortBlock, {
      preferredExternalPort: zmqPortBlock,
      addSsl: null,
      secure: { ssl: false },
      protocol: null,
    })
    const zmqBlock = sdk.createInterface(effects, {
      name: i18n('ZeroMQ Block'),
      id: zmqBlockInterfaceId,
      description: i18n(
        'Streams real-time Bitcoin block notifications (hashes and raw data)',
      ),
      type: 'api',
      masked: false,
      schemeOverride: null,
      username: null,
      path: '',
      query: {},
    })
    receipts.push(await zmqBlockOrigin.export([zmqBlock]))

    const zmqTxOrigin = await zmqMulti.bindPort(zmqPortTransaction, {
      preferredExternalPort: zmqPortTransaction,
      addSsl: null,
      secure: { ssl: false },
      protocol: null,
    })
    const zmqTx = sdk.createInterface(effects, {
      name: i18n('ZeroMQ Transaction'),
      id: zmqTxInterfaceId,
      description: i18n(
        'Streams real-time Bitcoin transaction notifications (hashes, raw data, and sequence)',
      ),
      type: 'api',
      masked: false,
      schemeOverride: null,
      username: null,
      path: '',
      query: {},
    })
    receipts.push(await zmqTxOrigin.export([zmqTx]))
  }

  // I2P (conditional)
  const i2pConsoleEnabled = await i2pdConfFile
    .read((c) => c.http.enabled)
    .const(effects)

  if (bitcoinConf?.raw?.i2psam && i2pConsoleEnabled) {
    const i2pMulti = sdk.MultiHost.of(effects, i2pConsoleHostId)
    const i2pConsoleOrigin = await i2pMulti.bindPort(i2pUiPort, {
      protocol: 'http',
    })

    const i2pConsole = sdk.createInterface(effects, {
      name: i18n('I2P Daemon Console'),
      id: 'i2p-console',
      description: i18n('Interface to access the embedded I2P daemon console'),
      type: 'ui',
      masked: false,
      schemeOverride: null,
      username: null,
      path: '',
      query: {},
    })

    const i2pConsoleReceipt = await i2pConsoleOrigin.export([i2pConsole])
    receipts.push(i2pConsoleReceipt)
  }

  return receipts
})
