import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { taskSetExternal } from './taskSetExternal'
import { seedFiles } from './seedFiles'
import { watchPrune } from './watchPrune'

export const init = sdk.setupInit(
  seedFiles,
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  taskSetExternal,
  watchPrune,
)

export const uninit = sdk.setupUninit(versionGraph)
