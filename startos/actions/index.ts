import { sdk } from '../sdk'
import { assumeutxo } from './assumeutxo'
import { autoconfig } from './config/autoconfig'
import { mempoolConfig } from './config/mempool'
import { otherConfig } from './config/other'
import { peerConfig } from './config/peers'
import { rpcConfig } from './config/rpc'
import { deleteCoinstatsIndex } from './deleteCoinstatsIndex'
import { deletePeers } from './deletePeers'
import { deleteRpcAuth } from './deleteRpcAuth'
import { deleteTxIndex } from './deleteTxIndex'
import { generateRpcUser } from './generateRpcUser'
import { generateRpcUserDependent } from './generateRpcUserDependent'
import { ipc } from './ipc'
import { reindexBlockchain } from './reindexBlockchain'
import { reindexChainstate } from './reindexChainstate'
import { runtimeInfo } from './runtimeInfo'
export const actions = sdk.Actions.of()
  .addAction(mempoolConfig)
  .addAction(peerConfig)
  .addAction(rpcConfig)
  .addAction(assumeutxo)
  .addAction(deleteCoinstatsIndex)
  .addAction(deletePeers)
  .addAction(deleteRpcAuth)
  .addAction(deleteTxIndex)
  .addAction(generateRpcUser)
  .addAction(generateRpcUserDependent)
  .addAction(otherConfig)
  .addAction(ipc)
  .addAction(reindexBlockchain)
  .addAction(reindexChainstate)
  .addAction(runtimeInfo)
  .addAction(autoconfig)
