import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_29_4_12 } from './v29.4_12'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_29_4_12],
})
