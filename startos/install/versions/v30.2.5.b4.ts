import { VersionInfo } from '@start9labs/start-sdk'

export const v_30_2_5_b4 = VersionInfo.of({
  version: '30.2:5-beta.4',
  releaseNotes: {
    en_US: 'Multiple bug fixes',
  },
  migrations: {
    down: async ({ effects }) => {},
  },
})
