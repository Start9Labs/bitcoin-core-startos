import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_31_1_12 } from './v31.1_12'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_31_1_12],
})
