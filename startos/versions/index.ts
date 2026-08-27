import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_28_4_25 } from './v28.4_25'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_28_4_25],
})
