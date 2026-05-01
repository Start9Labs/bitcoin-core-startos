import { VersionGraph } from '@start9labs/start-sdk'
import { v_28_3_9 } from './v28.3.9'
import { v_29_3_9 } from './v29.3.9'
import { v_30_2_9 } from './v30.2.9'

export const versionGraph = VersionGraph.of({
  current: v_30_2_9,
  other: [v_29_3_9, v_28_3_9],
})
