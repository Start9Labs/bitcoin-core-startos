import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_30_3_12 } from './v30.3_12'
import { v_30_3_25 } from './v30.3_25'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_30_3_12, v_30_3_25],
})
