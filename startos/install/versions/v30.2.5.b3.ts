import { VersionInfo } from '@start9labs/start-sdk'

export const v_30_2_5_b3 = VersionInfo.of({
  version: '30.2:5-beta.3',
  releaseNotes: {
    en_US: 'Multiple bug fixes',
  },
  migrations: {
    down: async ({ effects }) => {},
  },
})
