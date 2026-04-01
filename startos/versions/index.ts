import { VersionGraph } from '@start9labs/start-sdk'
import { v_29_3_5 } from './v29.3.5'
import { v_28_3_5 } from './v28.3.5'

export const versionGraph = VersionGraph.of({
  current: v_29_3_5,
  other: [v_28_3_5],
})
