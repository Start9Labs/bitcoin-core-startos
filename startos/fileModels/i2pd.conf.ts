import { FileHelper, matches } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const { object, string, boolean, literal, literals } = matches

const number = string.map((a) => Number(a)).orParser(matches.number)

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

const defaults = i2pdConfDefaults
export const shape = object({
  log: literal(defaults.log).onMismatch(defaults.log).defaultTo(defaults.log),
  loglevel: literals('none', 'critical', 'error', 'warn', 'info', 'debug')
    .onMismatch(defaults.loglevel)
    .defaultTo(defaults.loglevel),
  port: number.onMismatch(defaults.port).defaultTo(defaults.port),
  ipv4: boolean.onMismatch(defaults.ipv4).defaultTo(defaults.ipv4),
  ipv6: boolean.onMismatch(defaults.ipv6).defaultTo(defaults.ipv6),
  bandwidth: literals('L', 'O', 'P')
    .onMismatch(defaults.bandwidth)
    .defaultTo(defaults.bandwidth),
  share: number.onMismatch(defaults.share).defaultTo(defaults.share),
  notransit: boolean
    .onMismatch(defaults.notransit)
    .defaultTo(defaults.notransit),
  floodfill: boolean
    .onMismatch(defaults.floodfill)
    .defaultTo(defaults.floodfill),
  ntcp2: object({
    enabled: boolean
      .onMismatch(defaults.ntcp2.enabled)
      .defaultTo(defaults.ntcp2.enabled),
    published: boolean
      .onMismatch(defaults.ntcp2.published)
      .defaultTo(defaults.ntcp2.published),
  })
    .onMismatch(defaults.ntcp2)
    .defaultTo(defaults.ntcp2),
  ssu2: object({
    enabled: boolean
      .onMismatch(defaults.ssu2.enabled)
      .defaultTo(defaults.ssu2.enabled),
    published: boolean
      .onMismatch(defaults.ssu2.published)
      .defaultTo(defaults.ssu2.published),
  })
    .onMismatch(defaults.ssu2)
    .defaultTo(defaults.ssu2),
  http: object({
    enabled: boolean
      .onMismatch(defaults.http.enabled)
      .defaultTo(defaults.http.enabled),
    address: string
      .onMismatch(defaults.http.address)
      .defaultTo(defaults.http.address),
    port: number.onMismatch(defaults.http.port).defaultTo(defaults.http.port),
    strictheaders: boolean
      .onMismatch(defaults.http.strictheaders)
      .defaultTo(defaults.http.strictheaders),
  })
    .onMismatch(defaults.http)
    .defaultTo(defaults.http),
  httpproxy: object({
    enabled: boolean
      .onMismatch(defaults.httpproxy.enabled)
      .defaultTo(defaults.httpproxy.enabled),
  })
    .onMismatch(defaults.httpproxy)
    .defaultTo(defaults.httpproxy),
  socksproxy: object({
    enabled: boolean
      .onMismatch(defaults.socksproxy.enabled)
      .defaultTo(defaults.socksproxy.enabled),
  })
    .onMismatch(defaults.socksproxy)
    .defaultTo(defaults.socksproxy),
  sam: object({
    enabled: boolean
      .onMismatch(defaults.sam.enabled)
      .defaultTo(defaults.sam.enabled),
  })
    .onMismatch(defaults.sam)
    .defaultTo(defaults.sam),
  upnp: object({
    enabled: boolean
      .onMismatch(defaults.upnp.enabled)
      .defaultTo(defaults.upnp.enabled),
  })
    .onMismatch(defaults.upnp)
    .defaultTo(defaults.upnp),
  reseed: object({
    verify: boolean
      .onMismatch(defaults.reseed.verify)
      .defaultTo(defaults.reseed.verify),
  })
    .onMismatch(defaults.reseed)
    .defaultTo(defaults.reseed),
  limits: object({
    transittunnels: number
      .onMismatch(defaults.limits.transittunnels)
      .defaultTo(defaults.limits.transittunnels),
  })
    .onMismatch(defaults.limits)
    .defaultTo(defaults.limits),
})

export const i2pdConfFile = FileHelper.ini(
  {
    base: sdk.volumes.i2pd,
    subpath: '/data/i2pd.conf',
  },
  shape,
)
