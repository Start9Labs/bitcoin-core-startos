import { actions } from '../actions'
import { restoreInit } from '../backups'
import { setDependencies } from '../dependencies'
import { versionGraph } from '../install/versionGraph'
import { setInterfaces } from '../interfaces'
import { sdk } from '../sdk'
import { seedFiles } from './seedFiles'
import { taskSetExternal } from './taskSetExternal'

export const init = sdk.setupInit(
  seedFiles,
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  taskSetExternal,
)

export const uninit = sdk.setupUninit(versionGraph)
