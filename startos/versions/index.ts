import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_31_1_12 } from './v31.1_12'
import { v_31_1_27 } from './v31.1_27'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_31_1_12, v_31_1_27],
})
