import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { i2pSocksPort, i2pUiPort } from '../utils'

const iniNumber = z
  .union([z.string().transform(Number), z.number()])
  .pipe(z.number())

const iniBoolean = z.union([
  z.string().transform((s) => !!Number(s)),
  z.number().transform((n) => !!n),
  z.boolean(),
])

export const shape = z.object({
  log: z.literal('stdout').catch('stdout'),
  // Enforced, not defaulted: nothing exposes this setting, so a value already
  // on disk would stand forever. `critical` suppressed even bind and startup
  // failures, which is how an unreachable SAM bridge ended up with no trace in
  // the log at all (#261). `warn` is i2pd's own default and carries
  // critical/error/warn; seedFiles merges this file on every init, so existing
  // installs pick it up on update.
  loglevel: z.literal('warn').catch('warn'),
  port: iniNumber.catch(14096),
  ipv4: iniBoolean.catch(true),
  ipv6: iniBoolean.catch(false),
  // 'O' (256 KB/s). The old default 'L' (32 KB/s) is i2pd's lowest
  // class, and in the standalone i2pd package's field experience a class-L
  // router behind home NAT rarely gets its LeaseSet publication confirmed
  // inside its window — the "Publish confirmation was not received" loop —
  // leaving inbound I2P unreliable; that package ships 'O' for the same
  // reason. It costs no traffic here: this is a transit ceiling, and
  // notransit below refuses transit outright. A default only: any valid
  // hand-tuned value — L, O,
  // P, X, or a number in KB/s — survives every merge; the one-time raise
  // of an existing 'L' lives in versions/current.ts.
  bandwidth: z.union([z.enum(['L', 'O', 'P', 'X']), iniNumber]).catch('O'),
  share: iniNumber.catch(100),
  // This router exists to carry the node's own Bitcoin traffic, so it relays
  // none for anyone else. i2pd's bandwidth, share and transittunnels limits
  // all cap transit alone, which makes refusing it the only lever that takes
  // relayed traffic to zero — and what makes the 'O' class above free, since
  // advertised capacity it never lends out costs nothing. Relaying is what
  // the standalone i2pd service is for.
  notransit: iniBoolean.catch(true),
  floodfill: iniBoolean.catch(false),
  ntcp2: z
    .object({
      enabled: iniBoolean.catch(true),
      published: iniBoolean.catch(true),
    })
    .catch({ enabled: true, published: true }),
  ssu2: z
    .object({
      enabled: iniBoolean.catch(true),
      published: iniBoolean.catch(true),
    })
    .catch({ enabled: true, published: true }),
  http: z
    .object({
      enabled: iniBoolean.catch(false),
      address: z.string().catch('0.0.0.0'),
      port: iniNumber.catch(i2pUiPort),
      strictheaders: iniBoolean.catch(false),
    })
    .catch({
      enabled: false,
      address: '0.0.0.0',
      port: i2pUiPort,
      strictheaders: false,
    }),
  httpproxy: z
    .object({
      enabled: iniBoolean.catch(false),
    })
    .catch({ enabled: false }),
  // The block-fetch proxy dials .b32.i2p peers through this; it has no I2P
  // transport of its own and Tor cannot resolve them. Loopback-only, so it
  // stays inside the service's network namespace.
  socksproxy: z
    .object({
      enabled: iniBoolean.catch(true),
      address: z.literal('127.0.0.1').catch('127.0.0.1'),
      port: iniNumber.catch(i2pSocksPort),
    })
    .catch({ enabled: true, address: '127.0.0.1', port: i2pSocksPort }),
  sam: z
    .object({
      enabled: iniBoolean.catch(true),
    })
    .catch({ enabled: true }),
  i2pcontrol: z
    .object({
      enabled: iniBoolean.catch(true),
      address: z.literal('127.0.0.1').catch('127.0.0.1'),
      port: iniNumber.catch(7650),
      password: z.string().catch('itoopie'),
    })
    .catch({
      enabled: true,
      address: '127.0.0.1',
      port: 7650,
      password: 'itoopie',
    }),
  upnp: z
    .object({
      enabled: iniBoolean.catch(false),
    })
    .catch({ enabled: false }),
  reseed: z
    .object({
      verify: iniBoolean.catch(true),
    })
    .catch({ verify: true }),
  limits: z
    .object({
      transittunnels: iniNumber.catch(10000),
    })
    .catch({ transittunnels: 10000 }),
})

export const i2pdConfFile = FileHelper.ini(
  {
    base: sdk.volumes.i2pd,
    subpath: '/data/i2pd.conf',
  },
  shape,
)
