import { VersionGraph } from '@start9labs/start-sdk'
import { v_29_3_5_b6 } from './v29.3.5.b6'
import { v_28_3_5_b6 } from './v28.3.5.b6'

export const versionGraph = VersionGraph.of({
  current: v_29_3_5_b6,
  other: [v_28_3_5_b6],
})
