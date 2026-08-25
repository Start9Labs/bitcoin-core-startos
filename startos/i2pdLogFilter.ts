import { StringDecoder } from 'node:string_decoder'

/**
 * Filter for the embedded i2pd router's log stream.
 *
 * i2pd must log at `warn` (see fileModels/i2pd.conf.ts): anything quieter
 * suppressed the evidence for real failures — a dead SAM bridge, a reseed
 * that cannot complete. But at warn a healthy router also narrates its
 * routine network weather at ~25 lines a minute, which buries bitcoind's
 * ~1 line a minute and pushes a 10,000-line log export down to about six
 * hours of history. Field exports show the weather is >98% of i2pd's
 * output and none of it is actionable.
 *
 * The list below drops exactly those measured message families and nothing
 * else. Every pattern is anchored to one complete, known-benign message, so
 * a new variant, a different failure, or any line this list has never seen
 * still reaches the log — the failure-day signals (reseed failures, bind
 * and accept errors, clock skew, router status) are preserved by
 * construction, not by enumeration. Lines that pass are prefixed `[i2pd] `
 * so the survivors are attributable in the shared service log.
 *
 * The families are transcribed verbatim from i2pd 2.58.0 field exports.
 * A bump of the pinned i2pd image can reword them, which fails open: a
 * reworded line no longer matches and the flood returns — see UPDATING.md
 * for the re-validation step that belongs to an i2pd bump.
 */

// One entry per observed weather family. Anchor to the full message: a
// pattern that could also match an unseen message hides evidence.
const CHURN_FAMILIES: RegExp[] = [
  // Transport-session establishment weather: most I2P routers are
  // residential, firewalled, or gone; failed attempts are the normal case.
  /^Transports: Session to peer \S+ has not been created in \d+ seconds$/,
  /^NTCP2: (SessionCreated|Receive length) read error: (Operation canceled|Connection reset by peer|End of file)$/,
  /^NTCP2: SessionCreated AEAD verification failed$/,
  /^SSU2: Retry token is zero$/,
  /^SSU2: Unexpected message type \d+ from \S+ of \d+ bytes$/,
  /^SSU2: Unexpected message type \d+ instead \d+$/,
  /^SSU2: Session with \S+ was not established after \d+ seconds$/,
  /^SSU2: Session to \S+ already exists$/,
  /^SSU2: Session was not introduced after \d+ seconds$/,
  /^SSU2: Outgoing messages queue to \S+ is semi-full \(size = \d+, lag = -?[\d.]+, rtt = -?[\d.]+\)$/,
  /^SSU2: Incorrect data size for path response \d+$/,
  /^SSU2: Unexpected PeerTest message SourceConnID=\d+ DestConnID=\d+$/,
  /^SSU2: RelayIntro unknown router to introduce$/,
  /^SSU2: TokenRequest AEAD verification failed$/,
  /^SSU2: (SessionRequest|SessionCreated) message too short \d+$/,
  /^SSU2: SessionCreated AEAD verification failed$/,
  // Peer-database maintenance.
  /^Profiling: No profile yet for \S+$/,
  /^NetDbReq: Destination \S+ is requested already or cached$/,
  /^NetDbReq: \S+ not found after \d+ attempts$/,
  // Per-stream retry mechanics. LeaseSet-publication trouble stays
  // visible in both its forms — "Publish confirmation was not received"
  // and "LeaseSet was not confirmed" — because persistent occurrences are
  // a real inbound-reachability symptom, not stream weather.
  /^Streaming: Resend #\d+, another remote lease has been selected for stream with rSID=\d+, sSID=\d+$/,
  /^Streaming: Resend #\d+, another outbound tunnel has been selected for stream with sSID=\d+$/,
  /^Streaming: Unexpected stream status=\d+ for sSID=\d+$/,
  /^Streaming: (SYNACK )?packet was not ACKed after \d+ attempts, terminate, rSID=\d+, sSID=\d+$/,
  /^Streaming: LeaseSet \S+ (expired|not found)$/,
  /^Streaming: Remote LeaseSet not found$/,
  /^Streaming: Remote lease is not available, sSID=\d+$/,
  /^Streaming: Can't send packets, missing remote LeaseSet, sSID=\d+$/,
  /^Streaming: No packets have been received yet$/,
  /^Streaming: Can't obtain routing session, sSID=\d+$/,
  // Tunnel build-and-test churn: i2pd continuously builds and probes
  // tunnels; individual failures are expected and self-healing.
  /^Tunnels: Test of tunnel \d+ failed$/,
  /^Tunnel: Tunnel not found, tunnelID=\d+ previousTunnelID=\d+ type=\d+$/,
  /^Tunnel: Pending tunnel for message \d+ not found$/,
  /^TransitTunnel: Can't decrypt short request record \d+$/,
  /^TunnelMessage: Tunnel endpoint I2NP message size \d+ is not enough$/,
  /^TunnelMessage: Unexpected fragment \d+ instead \d+ of message \d+, saved$/,
  /^Router: Tunnel record AEAD decryption failed$/,
  // SAM per-stream teardown: bitcoind abandoning its own dial attempts.
  // Bridge-level failures stay visible — "SAM: Bind", "SAM: Accept error"
  // and "SAM: I2P acceptor has been reset" are the only router-side
  // evidence of a SAM bridge that stopped serving (#261's blind spot), so
  // they are deliberately NOT in this list.
  /^SAM: (Stream read|Read) error: (Operation canceled|End of file|Bad file descriptor)$/,
  /^SAM: Naming lookup failed\. LeaseSet for \S+ not found$/,
  /^SAM: Destination to connect not found$/,
  // Lookups for peers that have left the network.
  /^Destination: Request for \S+ not found$/,
  /^Destination: \S+ was not found within \d+ seconds$/,
  /^Destination: Remote LeaseSet expired$/,
  /^Destination: New remote LeaseSet failed$/,
  /^Destination: Couldn't find published LeaseSet for \S+$/,
  /^LeaseSet: Lease is expired already$/,
  // Undecryptable garlic/tunnel records from peer churn and key rotation.
  /^Garlic: Missing symmetric key for index \d+$/,
  /^Garlic: Can't handle ECIES-X25519-AEAD-Ratchet message$/,
  /^Garlic: (Flags\/static section|Payload for router) AEAD verification failed$/,
  /^Garlic: Payload section AEAD decryption failed$/,
  /^Garlic: Incoming sessions come too often$/,
  /^ElGamal decrypt hash doesn't match$/,
]

export const CHURN_FAMILY_COUNT = CHURN_FAMILIES.length

// i2pd wraps the level field in ANSI colour on every stdout write and offers no
// way to turn it off (Log.cpp, `case eLogStdout`; only the file destination is
// left plain), so the header never parses until these are gone.
const ANSI_SGR = /\x1b\[[0-9;]*m/g

// i2pd line shape: `HH:MM:SS@<thread>/<level> - <message>`, tolerantly
// matched (optional leading date token, fractional seconds, non-numeric
// thread ids) so a format drift does not blind the matcher. A line whose
// header still does not parse is tested whole, which no family can match —
// the filter fails open to "keep everything" rather than guessing.
const MESSAGE = /^(?:\S+ )?\d{2}:\d{2}:\d{2}(?:[.,]\d+)?@\w+\/\w+ - (.*)$/

export const isI2pdChurn = (line: string): boolean => {
  const message = MESSAGE.exec(line.replace(ANSI_SGR, ''))?.[1] ?? line
  return CHURN_FAMILIES.some((family) => family.test(message))
}

// A partial line that sits unfinished this long means the stream stalled
// or the daemon died mid-write: flush it as evidence. It also empties the
// carry between child generations — the SDK builds the daemon's exec once
// and reuses these closures across every crash-restart, so without the
// flush a dying process's tail would glue onto the next process's banner.
const FLUSH_AFTER_MS = 2000

// A stream with no newline in this many characters is not line-oriented
// output; pass it through (unfiltered, still prefixed) rather than
// buffering it forever.
const CARRY_LIMIT = 65536

/**
 * Returns a chunk handler for one of the daemon's output streams. Chunks
 * are reassembled into lines (a chunk boundary can fall mid-line or
 * mid-codepoint, so each stream needs its own instance), churn lines are
 * dropped, and everything else is written out prefixed `[i2pd] `.
 */
export const i2pdLogFilter = (out: {
  write(data: string): unknown
}): ((chunk: Buffer | string) => void) => {
  const decoder = new StringDecoder('utf8')
  let carry = ''
  let flushTimer: NodeJS.Timeout | undefined

  // The consumer end of the log pipe is outside our control; a write
  // failure there must not take down the supervisor that owns bitcoind.
  const write = (line: string) => {
    try {
      out.write(`[i2pd] ${line}\n`)
    } catch {}
  }

  const emit = (line: string) => {
    if (!isI2pdChurn(line)) write(line)
  }

  const flush = () => {
    if (carry) {
      // Stalled or dying partial line: always evidence, never weather.
      write(carry)
      carry = ''
    }
  }

  return (chunk) => {
    if (flushTimer) clearTimeout(flushTimer)
    carry += typeof chunk === 'string' ? chunk : decoder.write(chunk)
    let newline
    while ((newline = carry.indexOf('\n')) !== -1) {
      emit(carry.slice(0, newline).replace(/\r$/, ''))
      carry = carry.slice(newline + 1)
    }
    if (carry.length > CARRY_LIMIT) flush()
    if (carry) {
      flushTimer = setTimeout(flush, FLUSH_AFTER_MS)
      flushTimer.unref?.()
    }
  }
}
