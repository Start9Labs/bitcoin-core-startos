import { VersionGraph } from '@start9labs/start-sdk'
import { v_30_2_5_b6 } from './v30.2.5.b6'
import { v_28_3_5_b6 } from './v28.3.5.b6'
import { v_29_3_5_b6 } from './v29.3.5.b6'

export const versionGraph = VersionGraph.of({
  current: v_30_2_5_b6,
  other: [v_29_3_5_b6, v_28_3_5_b6],
})
