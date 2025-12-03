import { sdk } from '../sdk'
import { config } from './config/other'
import { mempoolConfig } from './config/mempool'
import { peerConfig } from './config/peers'
import { rpcConfig } from './config/rpc'
import { deleteCoinstatsIndex } from './deleteCoinstatsIndex'
import { deletePeers } from './deletePeers'
import { deleteRpcAuth } from './deleteRpcAuth'
import { deleteTxIndex } from './deleteTxIndex'
import { generateRpcUser } from './generateRpcAuth'
import { generateRpcUserDependent } from './generateRpcUserDependent'
import { reindexBlockchain } from './reindexBlockchain'
import { reindexChainstate } from './reindexChainstate'
import { runtimeInfo } from './runtimeInfo'
import { assumeutxo } from './assumeutxo'

export const actions = sdk.Actions.of()
  .addAction(runtimeInfo)
  .addAction(deleteCoinstatsIndex)
  .addAction(deletePeers)
  .addAction(deleteTxIndex)
  .addAction(reindexBlockchain)
  .addAction(reindexChainstate)
  .addAction(config)
  .addAction(rpcConfig)
  .addAction(generateRpcUser)
  .addAction(deleteRpcAuth)
  .addAction(mempoolConfig)
  .addAction(peerConfig)
  .addAction(generateRpcUserDependent)
  .addAction(assumeutxo)