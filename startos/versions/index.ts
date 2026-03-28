import { VersionGraph } from '@start9labs/start-sdk'
import { v_30_2_5_b7 } from './v30.2.5.b7'
import { v_28_3_5_b7 } from './v28.3.5.b7'
import { v_29_3_5_b7 } from './v29.3.5.b7'

export const versionGraph = VersionGraph.of({
  current: v_30_2_5_b7,
  other: [v_29_3_5_b7, v_28_3_5_b7],
})
