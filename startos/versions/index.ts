import { VersionGraph } from '@start9labs/start-sdk'
import { v_30_2_5_b5 } from './v30.2.5.b5'
import { v_28_3_5_b5 } from './v28.3.5.b5'
import { v_29_3_5_b5 } from './v29.3.5.b5'

export const versionGraph = VersionGraph.of({
  current: v_30_2_5_b5,
  other: [v_29_3_5_b5, v_28_3_5_b5],
})
