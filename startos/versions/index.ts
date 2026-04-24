import { VersionGraph } from '@start9labs/start-sdk'
import { v_29_3_8 } from './v29.3.8'
import { v_28_3_8 } from './v28.3.8'

export const versionGraph = VersionGraph.of({
  current: v_29_3_8,
  other: [v_28_3_8],
})
