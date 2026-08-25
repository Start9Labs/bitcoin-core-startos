// Run with: npm test  (node --experimental-strip-types --test test/)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { i2pdLogFilter, isI2pdChurn } from '../startos/i2pdLogFilter.ts'

// At least one real line per drop family, in CHURN_FAMILIES order, taken
// verbatim from two i2pd 2.58.0 field exports (identifiers included — they
// are public router hashes).
const DROPPED = [
  '12:44:05@235/warn - Transports: Session to peer ScbqgA4rDJDYsALzrkV~e7ztFYWD-v6Nyyknjoh15WE= has not been created in 15 seconds',
  '10:44:07@224/warn - NTCP2: SessionCreated read error: End of file',
  '16:46:24@224/warn - NTCP2: SessionCreated read error: Connection reset by peer',
  '10:57:00@224/warn - NTCP2: Receive length read error: Connection reset by peer',
  '11:02:00@224/warn - NTCP2: SessionCreated AEAD verification failed',
  '10:44:07@802/warn - SSU2: Retry token is zero',
  '11:34:41@939/warn - SSU2: Unexpected message type 208 from 35.202.131.136:23625 of 98 bytes',
  '11:35:00@939/warn - SSU2: Unexpected message type 29 instead 25',
  '12:04:46@939/warn - SSU2: Session with 109.89.147.35:12345 was not established after 5 seconds',
  '12:05:00@939/warn - SSU2: Session to ScbqgA4rDJDYsALzrkV~e7ztFYWD-v6Nyyknjoh15WE= already exists',
  '12:05:10@939/warn - SSU2: Session was not introduced after 25 seconds',
  '12:06:00@939/warn - SSU2: Outgoing messages queue to vNVn is semi-full (size = 511, lag = 12.5, rtt = 350)',
  '12:06:10@939/warn - SSU2: Outgoing messages queue to NJHP is semi-full (size = 128, lag = 0.5, rtt = -1)',
  '12:07:00@939/warn - SSU2: Incorrect data size for path response 8',
  '12:08:00@939/warn - SSU2: Unexpected PeerTest message SourceConnID=123 DestConnID=456',
  '12:09:00@939/warn - SSU2: RelayIntro unknown router to introduce',
  '12:10:00@939/warn - SSU2: TokenRequest AEAD verification failed',
  '12:11:00@939/warn - SSU2: SessionRequest message too short 47',
  '12:11:10@939/warn - SSU2: SessionCreated message too short 47',
  '12:12:00@939/warn - SSU2: SessionCreated AEAD verification failed',
  '10:44:04@512/warn - Profiling: No profile yet for nZDCHvUwYCTSZLniXQu1ggDLm4ka3Ecy9bKfOMej-MQ=',
  '10:44:04@513/warn - NetDbReq: Destination ~SWAX1lDQOkz-Q0I0Bd0WS354RVC5aYTE0ZrK8e7Cs8= is requested already or cached',
  '10:44:07@513/warn - NetDbReq: PdL36wwSFDuLz5GEv7b2PBNN1RbEsE3kohbrlJCZYOM= not found after 5 attempts',
  '10:50:00@96/warn - Streaming: Resend #1, another remote lease has been selected for stream with rSID=361620090, sSID=123',
  '10:51:00@96/warn - Streaming: Resend #2, another outbound tunnel has been selected for stream with sSID=789',
  '16:46:16@96/warn - Streaming: Unexpected stream status=5 for sSID=361620090',
  '10:52:00@96/warn - Streaming: packet was not ACKed after 5 attempts, terminate, rSID=1, sSID=2',
  '10:52:30@96/warn - Streaming: SYNACK packet was not ACKed after 5 attempts, terminate, rSID=3, sSID=4',
  '10:53:00@96/warn - Streaming: LeaseSet aFH2ynQ7M3QMpmuwKqJbeK47gIFYGiGEEIe1LXyBE7Q= expired',
  '10:53:10@96/warn - Streaming: LeaseSet iBxb3XlibXURadCU8HaJXl1BeZuGPBjZA59DoApmIxQ= not found',
  '10:54:00@96/warn - Streaming: Remote LeaseSet not found',
  '10:54:10@96/warn - Streaming: Remote lease is not available, sSID=123',
  "10:54:20@96/warn - Streaming: Can't send packets, missing remote LeaseSet, sSID=1869987657",
  '10:54:30@96/warn - Streaming: No packets have been received yet',
  "10:55:00@96/error - Streaming: Can't obtain routing session, sSID=123",
  '12:04:52@690/warn - Tunnels: Test of tunnel 2173116951 failed',
  '12:05:52@690/warn - Tunnel: Tunnel not found, tunnelID=12 previousTunnelID=34 type=2',
  '12:05:55@690/warn - Tunnel: Pending tunnel for message 12345 not found',
  "12:06:52@690/warn - TransitTunnel: Can't decrypt short request record 1",
  '12:07:52@690/warn - TunnelMessage: Tunnel endpoint I2NP message size 64000 is not enough',
  '12:08:52@690/warn - TunnelMessage: Unexpected fragment 2 instead 1 of message 12345, saved',
  '12:09:52@690/warn - Router: Tunnel record AEAD decryption failed',
  '16:46:16@96/error - SAM: Read error: Operation canceled',
  '05:39:03@963/error - SAM: Stream read error: Operation canceled',
  '11:43:56@619/error - SAM: Read error: End of file',
  '11:43:56@619/error - SAM: Read error: Bad file descriptor',
  '11:44:00@619/error - SAM: Naming lookup failed. LeaseSet for 46fl6ax5koztdgusn677owayam3nqjzhkw622akpir6slippma2q.b32.i2p not found',
  '11:44:10@619/error - SAM: Destination to connect not found',
  '11:45:00@100/warn - Destination: Request for 0eNcLP2imyqoiU480XKis2Rar5oVBf9VWmOG5P73XJw= not found',
  '11:45:10@100/warn - Destination: 54q~Av1TszGakm-~91gYAzbYJydVva0BT0R9JaHvYDU= was not found within 12000 seconds',
  '11:45:20@100/warn - Destination: Remote LeaseSet expired',
  '11:45:30@100/warn - Destination: New remote LeaseSet failed',
  "11:45:40@100/warn - Destination: Couldn't find published LeaseSet for 46fl6ax5koztdgusn677owayam3nqjzhkw622akpir6slippma2q",
  '11:46:00@100/warn - LeaseSet: Lease is expired already',
  '10:57:16@96/error - Garlic: Missing symmetric key for index 0',
  "10:58:00@96/error - Garlic: Can't handle ECIES-X25519-AEAD-Ratchet message",
  '10:58:10@96/error - Garlic: Flags/static section AEAD verification failed',
  '10:58:15@96/warn - Garlic: Payload for router AEAD verification failed',
  '10:58:05@96/warn - Garlic: Payload section AEAD decryption failed',
  '10:58:20@96/error - Garlic: Incoming sessions come too often',
  "10:59:00@96/error - ElGamal decrypt hash doesn't match",
  // Header-format drift must not blind the matcher: a leading date token,
  // fractional seconds, or an alphanumeric thread id still parses.
  '2026-08-24 12:44:05@235/warn - SSU2: Retry token is zero',
  '12:44:05.123@main/warn - Profiling: No profile yet for nZDCHvUwYCTSZLniXQu1ggDLm4ka3Ecy9bKfOMej-MQ=',
]

// Failure evidence and unknown lines must always pass. The first block is
// verbatim field lines or documented failure shapes; the second is novel
// variants of known families, proving the default-pass property — the
// filter drops what it knows, never what it doesn't.
const KEPT = [
  '11:34:30@39/none - i2pd v2.58.0 (0.9.67) starting...',
  '13:00:00@100/warn - Destination: Publish confirmation was not received in 1800 milliseconds or failed. will try again',
  '10:53:20@96/warn - Streaming: LeaseSet was not confirmed in 5000 milliseconds. Trying to resubmit',
  '13:01:00@963/error - SAM: Bind error: Address already in use',
  '11:44:20@619/error - SAM: Accept error: Bad file descriptor',
  '11:44:30@619/warn - SAM: I2P acceptor has been reset',
  '13:02:00@700/error - Reseed: Failed to reseed from https://reseed.i2p-projekt.de/',
  '13:03:00@235/warn - Transports: Clock skew 3600 seconds detected',
  '13:04:00@513/error - NetDb: Network database is empty',
  // Novel variants of dropped families: the anchoring must not swallow
  // a message with new failure detail appended.
  '13:05:00@96/warn - Streaming: Resend #3, giving up, closing session',
  '13:05:10@939/warn - SSU2: Unexpected message type 0 -- ABORTING, router shutting down',
  '13:05:20@96/error - SAM: Read error: Connection refused',
  'a line with no i2pd prefix at all',
]

test('drops every known weather family', () => {
  for (const line of DROPPED) {
    assert.equal(isI2pdChurn(line), true, `should drop: ${line}`)
  }
})

test('keeps failure evidence and anything unknown', () => {
  for (const line of KEPT) {
    assert.equal(isI2pdChurn(line), false, `should keep: ${line}`)
  }
})

// i2pd colours the level field on every stdout write and cannot be told not to,
// so these — captured verbatim off a running router — are the shape the filter
// actually sees. Plain fixtures alone let a filter that never parses a real
// header pass the whole suite.
const COLOURED_DROPPED = [
  '00:30:46@110/\x1b[1;33mwarn\x1b[0m - Profiling: No profile yet for 0dP41hr14ijCvPGIQu-nYd5D40Db-tDPEuqx5FgCIJU=',
  '00:30:37@288/\x1b[1;33mwarn\x1b[0m - NTCP2: SessionCreated read error: End of file',
  '00:31:55@288/\x1b[1;33mwarn\x1b[0m - NTCP2: SessionCreated read error: Connection reset by peer',
]

const COLOURED_KEPT = [
  "00:29:53@989/\x1b[1;33mwarn\x1b[0m - Addressbook: Can't open /var/lib/i2pd/addressbook/addresses.csv",
  '00:29:53@989/\x1b[1;31merror\x1b[0m - Addressbook: Resetting eTags',
]

test('drops churn whose level field is ANSI-coloured', () => {
  for (const line of COLOURED_DROPPED) {
    assert.equal(isI2pdChurn(line), true, `should drop: ${line}`)
  }
})

test('keeps non-churn whose level field is ANSI-coloured', () => {
  for (const line of COLOURED_KEPT) {
    assert.equal(isI2pdChurn(line), false, `should keep: ${line}`)
  }
})

const collect = () => {
  const out: string[] = []
  return { out, write: (s: string) => out.push(s) }
}

test('emits a kept coloured line with its colour intact', () => {
  const sink = collect()
  const filter = i2pdLogFilter(sink)
  filter(Buffer.from(`${COLOURED_KEPT[0]}\n`))
  assert.deepEqual(sink.out, [`[i2pd] ${COLOURED_KEPT[0]}\n`])
})

test('kept lines are emitted with the [i2pd] prefix and newline', () => {
  const sink = collect()
  const filter = i2pdLogFilter(sink)
  filter(Buffer.from(`${KEPT[0]}\n`))
  assert.deepEqual(sink.out, [`[i2pd] ${KEPT[0]}\n`])
})

test('reassembles a line split across chunks', () => {
  const sink = collect()
  const filter = i2pdLogFilter(sink)
  const line = KEPT[1]
  filter(Buffer.from(line.slice(0, 10)))
  filter(Buffer.from(line.slice(10, 25)))
  filter(Buffer.from(line.slice(25) + '\n'))
  assert.deepEqual(sink.out, [`[i2pd] ${line}\n`])
})

test('a churn line split across chunks is still dropped', () => {
  const sink = collect()
  const filter = i2pdLogFilter(sink)
  const line = DROPPED[0]
  filter(Buffer.from(line.slice(0, 30)))
  filter(Buffer.from(line.slice(30) + '\n' + KEPT[0] + '\n'))
  assert.deepEqual(sink.out, [`[i2pd] ${KEPT[0]}\n`])
})

test('handles several lines in one chunk and strips CR', () => {
  const sink = collect()
  const filter = i2pdLogFilter(sink)
  filter(Buffer.from(`${DROPPED[1]}\r\n${KEPT[0]}\r\n${DROPPED[2]}\n`))
  assert.deepEqual(sink.out, [`[i2pd] ${KEPT[0]}\n`])
})

test('reassembles a UTF-8 codepoint split across chunks', () => {
  const sink = collect()
  const filter = i2pdLogFilter(sink)
  const line = '13:06:00@39/warn - Config: unexpected value €42'
  const bytes = Buffer.from(line + '\n')
  // Split inside the three-byte € sequence.
  const cut = bytes.indexOf(0xe2) + 1
  filter(bytes.subarray(0, cut))
  filter(bytes.subarray(cut))
  assert.deepEqual(sink.out, [`[i2pd] ${line}\n`])
})

test('flushes a stalled partial line instead of holding it forever', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const sink = collect()
  const filter = i2pdLogFilter(sink)
  filter(Buffer.from('13:01:00@963/error - SAM: Bind erro'))
  assert.deepEqual(sink.out, [])
  t.mock.timers.tick(2500)
  assert.deepEqual(sink.out, ['[i2pd] 13:01:00@963/error - SAM: Bind erro\n'])
  // The flush emptied the carry: the next generation's banner arrives clean.
  filter(Buffer.from(`${KEPT[0]}\n`))
  assert.deepEqual(sink.out, [
    '[i2pd] 13:01:00@963/error - SAM: Bind erro\n',
    `[i2pd] ${KEPT[0]}\n`,
  ])
})

test('a line completed before the flush timer fires is emitted once', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const sink = collect()
  const filter = i2pdLogFilter(sink)
  const line = KEPT[3]
  filter(Buffer.from(line.slice(0, 12)))
  filter(Buffer.from(line.slice(12) + '\n'))
  t.mock.timers.tick(10000)
  assert.deepEqual(sink.out, [`[i2pd] ${line}\n`])
})

test('passes non-line-oriented output through unfiltered at the carry limit', () => {
  const sink = collect()
  const filter = i2pdLogFilter(sink)
  // Even a blob opening like a churn family must not be dropped.
  filter(Buffer.from('Transports: Session to peer ' + 'x'.repeat(70000)))
  assert.equal(sink.out.length, 1)
  assert.ok(sink.out[0].startsWith('[i2pd] Transports: Session to peer xxx'))
})
