import { VersionInfo } from '@start9labs/start-sdk'
import { ensureFiles } from './ensureFiles'

export const v_30_2_5_b2 = VersionInfo.of({
  version: '30.2:5-beta.2',
  releaseNotes: {
    en_US: 'Fix pruning bug: archival nodes no longer auto-switch to pruning',
  },
  migrations: {
    up: async ({ effects }) => {
      await ensureFiles(effects)
    },
    down: async ({ effects }) => {},
  },
})
