import { VersionInfo } from '@start9labs/start-sdk'
export const v30_0_0_1_beta1 = VersionInfo.of({
  version: '30.0.0:1-beta.1',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
