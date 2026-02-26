import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { i2pUiPort } from '../utils'

const iniNumber = z.union([z.string().transform(Number), z.number()])

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
    port: i2pUiPort,
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
  ntcp2: z
    .object({
      enabled: iniBoolean.catch(d.ntcp2.enabled),
      published: iniBoolean.catch(d.ntcp2.published),
    })
    .catch(d.ntcp2),
  ssu2: z
    .object({
      enabled: iniBoolean.catch(d.ssu2.enabled),
      published: iniBoolean.catch(d.ssu2.published),
    })
    .catch(d.ssu2),
  http: z
    .object({
      enabled: iniBoolean.catch(d.http.enabled),
      address: z.string().catch(d.http.address),
      port: iniNumber.catch(d.http.port),
      strictheaders: iniBoolean.catch(d.http.strictheaders),
    })
    .catch(d.http),
  httpproxy: z
    .object({
      enabled: iniBoolean.catch(d.httpproxy.enabled),
    })
    .catch(d.httpproxy),
  socksproxy: z
    .object({
      enabled: iniBoolean.catch(d.socksproxy.enabled),
    })
    .catch(d.socksproxy),
  sam: z
    .object({
      enabled: iniBoolean.catch(d.sam.enabled),
    })
    .catch(d.sam),
  upnp: z
    .object({
      enabled: iniBoolean.catch(d.upnp.enabled),
    })
    .catch(d.upnp),
  reseed: z
    .object({
      verify: iniBoolean.catch(d.reseed.verify),
    })
    .catch(d.reseed),
  limits: z
    .object({
      transittunnels: iniNumber.catch(d.limits.transittunnels),
    })
    .catch(d.limits),
})

export const i2pdConfFile = FileHelper.ini(
  {
    base: sdk.volumes.i2pd,
    subpath: '/data/i2pd.conf',
  },
  shape,
)
