import { VersionGraph } from '@start9labs/start-sdk'
import { v_28_3_7 } from './v28.3.7'
import { v_29_3_7 } from './v29.3.7'
import { v_30_2_7 } from './v30.2.7'

export const versionGraph = VersionGraph.of({
  current: v_30_2_7,
  other: [v_29_3_7, v_28_3_7],
})
