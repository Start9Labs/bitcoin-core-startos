import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const iniNumber = z.union([
  z.string().transform(Number),
  z.number(),
])

const iniBoolean = z.union([
  z.string().transform((s) => !!Number(s)),
  z.number().transform((n) => !!n),
  z.boolean(),
])

export const i2pdConfDefaults = {
  log: 'stdout' as const,
  loglevel: 'critical' as const,
  port: 14096,
  ipv4: true,
  ipv6: false,
  bandwidth: 'L' as const,
  share: 100,
  notransit: false,
  floodfill: false,
  ntcp2: {
    enabled: true,
    published: true,
  },
  ssu2: {
    enabled: true,
    published: true,
  },
  http: {
    enabled: false,
    address: '0.0.0.0',
    port: 7070,
    strictheaders: false,
  },
  httpproxy: {
    enabled: false,
  },
  socksproxy: {
    enabled: false,
  },
  sam: {
    enabled: true,
  },
  upnp: {
    enabled: false,
  },
  reseed: {
    verify: true,
  },
  limits: {
    transittunnels: 10000,
  },
}

const d = i2pdConfDefaults
export const shape = z.object({
  log: z.literal(d.log).catch(d.log),
  loglevel: z
    .enum(['none', 'critical', 'error', 'warn', 'info', 'debug'])
    .catch(d.loglevel),
  port: iniNumber.catch(d.port),
  ipv4: iniBoolean.catch(d.ipv4),
  ipv6: iniBoolean.catch(d.ipv6),
  bandwidth: z.enum(['L', 'O', 'P']).catch(d.bandwidth),
  share: iniNumber.catch(d.share),
  notransit: iniBoolean.catch(d.notransit),
  floodfill: iniBoolean.catch(d.floodfill),
  ntcp2: z.object({
    enabled: iniBoolean.catch(d.ntcp2.enabled),
    published: iniBoolean.catch(d.ntcp2.published),
  }),
  ssu2: z.object({
    enabled: iniBoolean.catch(d.ssu2.enabled),
    published: iniBoolean.catch(d.ssu2.published),
  }),
  http: z.object({
    enabled: iniBoolean.catch(d.http.enabled),
    address: z.string().catch(d.http.address),
    port: iniNumber.catch(d.http.port),
    strictheaders: iniBoolean.catch(d.http.strictheaders),
  }),
  httpproxy: z.object({
    enabled: iniBoolean.catch(d.httpproxy.enabled),
  }),
  socksproxy: z.object({
    enabled: iniBoolean.catch(d.socksproxy.enabled),
  }),
  sam: z.object({
    enabled: iniBoolean.catch(d.sam.enabled),
  }),
  upnp: z.object({
    enabled: iniBoolean.catch(d.upnp.enabled),
  }),
  reseed: z.object({
    verify: iniBoolean.catch(d.reseed.verify),
  }),
  limits: z.object({
    transittunnels: iniNumber.catch(d.limits.transittunnels),
  }),
})

export const i2pdConfFile = FileHelper.ini(
  {
    base: sdk.volumes.i2pd,
    subpath: '/data/i2pd.conf',
  },
  shape,
)
