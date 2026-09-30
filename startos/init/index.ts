import { actions } from '../actions'
import { restoreInit } from '../backups'
import { dependencies } from '../dependencies'
import { versionGraph } from '../versions'
import { setInterfaces } from '../interfaces'
import { sdk } from '../sdk'
import { reattachPeerOnions } from './reattachPeerOnions'
import { seedFiles } from './seedFiles'
import { watchHosts } from './watchHosts'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  actions,
  dependencies,
  watchHosts,
  reattachPeerOnions,
)

export const uninit = sdk.setupUninit(versionGraph)
