import { bitcoinConfFile } from './fileModels/bitcoin.conf'
import { i2pdConfFile } from './fileModels/i2pd.conf'
import { sdk } from './sdk'
import {
  embeddedI2PSamAddress,
  peerInterfaceId,
  peerPort,
  rpcInterfaceId,
  rpcPort,
  zmqInterfaceId,
  zmqPort,
} from './utils'
import { i18n } from './i18n'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  let config = await bitcoinConfFile.read().const(effects)

  if (!config) return []

  // RPC
  const rpcMulti = sdk.MultiHost.of(effects, 'rpc')
  const rpcMultiOrigin = await rpcMulti.bindPort(rpcPort, {
    protocol: 'http',
    preferredExternalPort: rpcPort,
  })
  const rpc = sdk.createInterface(effects, {
    name: i18n('RPC Interface'),
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

  // PEER
  const peerMulti = sdk.MultiHost.of(effects, 'peer')
  const peerMultiOrigin = await peerMulti.bindPort(peerPort, {
    protocol: null,
    preferredExternalPort: peerPort,
    addSsl: null,
    secure: { ssl: false },
  })
  const peer = sdk.createInterface(effects, {
    name: i18n('Peer Interface'),
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

  // ZMQ (conditional)
  if (config.zmqpubhashblock) {
    const zmqMulti = sdk.MultiHost.of(effects, 'zmq')
    const zmqMultiOrigin = await zmqMulti.bindPort(zmqPort, {
      preferredExternalPort: zmqPort,
      addSsl: null,
      secure: { ssl: false },
      protocol: null,
    })
    const zmq = sdk.createInterface(effects, {
      name: i18n('ZeroMQ Interface'),
      id: zmqInterfaceId,
      description: i18n(
        'Listens for incoming connections from peers on the bitcoin network',
      ),
      type: 'api',
      masked: false,
      schemeOverride: null,
      username: null,
      path: '',
      query: {},
    })
    const zmqReceipt = await zmqMultiOrigin.export([zmq])

    receipts.push(zmqReceipt)
  }

  const i2pConsoleEnabled = await i2pdConfFile.read((x) => x.http.enabled).const(effects) ?? false
  if (config.i2psam === embeddedI2PSamAddress && i2pConsoleEnabled) {
    const i2pMulti = sdk.MultiHost.of(effects, 'i2p-console')
    const i2pConsoleOrigin = await i2pMulti.bindPort(7070, {
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
