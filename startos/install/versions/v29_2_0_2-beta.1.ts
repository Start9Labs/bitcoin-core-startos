import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
export const v29_2_0_2beta1 = VersionInfo.of({
  version: '29.2:2-beta.1',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
