import { GetBlockchainInfo, bitcoinCliArgs } from './utils'

/**
 * Chain-split recovery for the shared `bitcoind` datadir. This module is
 * byte-identical in every bitcoind flavor's repo; only the callers differ.
 *
 * All bitcoind flavors (Bitcoin Core, Bitcoin Knots pre-RDTS, Bitcoin Knots
 * RDTS) share one package id and one data volume, so a flavor switch carries
 * the source flavor's persisted per-block validity verdicts
 * (CBlockIndex::nStatus, serialized in blocks/index/) into the destination
 * binary. Those verdicts are trusted verbatim on startup — bitcoind never
 * re-validates buried blocks under the new binary's rules, and the persisted
 * validity level does not record which consensus rules produced it. Around a
 * contentious BIP-110 (RDTS) chain split that inheritance makes the node
 * follow the wrong chain in both directions:
 *
 * - Leaving enforcement (switching to Core / pre-RDTS Knots): RDTS-driven
 *   BLOCK_FAILED_VALID marks persist, so the non-enforcing flavor refuses
 *   the most-work chain it would otherwise follow. Remedy: `reconsiderblock`
 *   each invalid chain tip (reconsiderInvalidTips).
 * - Entering enforcement (switching to RDTS Knots, or a package update that
 *   moves the pin from a pre-RDTS to an RDTS release): blocks connected
 *   while enforcement was off are cache-valid and never re-checked against
 *   RDTS — the publicly disclosed BIP-110 late-upgrade validation gap.
 *   Remedy: disconnect and replay
 *   every block from the first RDTS-applicable height under the now-active
 *   rules (revalidateAgainstRdts). All three RDTS rule classes re-run on
 *   reconnect: mandatory signaling and the output-size limit are re-checked
 *   in ConnectBlock unconditionally, and script rules re-run because the
 *   enforcing release's default assumevalid point (height 912,683 in
 *   v29.3.knots20260508) is far below the RDTS-applicable range.
 *
 * Enforcement model: whether a node enforces RDTS is a property of the
 * running *binary*, not of configuration. The RDTS-enforcing flavor pins an
 * official Knots release built with RDTS_CONSENT=RUNTIME_WARN
 * (contrib/guix/libexec/build.sh), which enforces on mainnet from its first
 * start regardless of `consensusrules` — that option records user consent
 * (and silences an hourly warning), it does not gate enforcement. Bitcoin
 * Core and pre-RDTS Knots binaries never enforce. Callers therefore derive
 * enforcement from the node itself via getRdtsDeployment (never-enforcing
 * flavors may hardcode false), and every flavor's main.ts records it in the
 * `rdtsEnforcedLastRun` store marker each start, treating a change as a
 * switch between enforcement regimes.
 *
 * Both remedies are safe no-ops when there is nothing to fix, and both
 * self-heal: a reconsidered block that is still invalid under the running
 * rules is simply re-marked invalid when its reconnection is attempted, and
 * the node settles on the best remaining valid chain.
 */

/** A container that can run bitcoin-cli against the live bitcoind. */
export type CliRunner = {
  exec: (cmd: string[]) => Promise<{
    exitCode: number | null
    stdout: string | Buffer
    stderr: string | Buffer
  }>
}

/**
 * First height at which any BIP-110 (RDTS) rule can apply to a block on
 * mainnet: the start of the mandatory-signaling interval,
 * max_activation_height (965,664) − 2 × signaling window (2,016) = 961,632.
 * Anchoring re-validation here covers the whole mandatory-signaling
 * interval (961,632–963,647) and every possible ACTIVE range: from the
 * deployment's current mainnet state (STARTED below the window), the
 * earliest reachable activation height equals the window start.
 * rdtsAnchorHeight() additionally derives the anchor from the running
 * node's own deployment parameters and uses whichever is lowest, so a
 * hypothetical earlier activation can only widen the re-validated range.
 *
 * Must match the consensus params of the Knots release pinned by the
 * RDTS-enforcing flavor (verified against v29.3.knots20260508). When that
 * flavor bumps its pinned release, re-verify these params and that its
 * defaultAssumeValid stays below this height.
 */
export const RDTS_FIRST_APPLICABLE_HEIGHT = 961_632

export type RdtsDeployment = {
  type: string
  /** First height at which the rules are enforced (present once active). */
  height?: number
  active: boolean
  bip9?: {
    start_time: number
    min_activation_height?: number
    max_activation_height?: number
    status: string
    since: number
    status_next?: string
    statistics?: { period: number }
  }
}

export type GetDeploymentInfo = {
  hash: string
  height: number
  deployments: Record<string, RdtsDeployment | undefined>
}

export type ChainTip = {
  height: number
  hash: string
  branchlen: number
  status:
    | 'active'
    | 'invalid'
    | 'headers-only'
    | 'valid-headers'
    | 'valid-fork'
    | 'unknown'
}

export type ChainState = {
  blocks: number
  bestblockhash: string
  snapshot_blockhash?: string
  validated: boolean
}

export type GetChainStates = {
  headers: number
  chainstates: ChainState[]
}

const cli = async (
  subc: CliRunner,
  opts: { prune: boolean },
  ...cmd: string[]
): Promise<string> => {
  const res = await subc.exec([
    ...bitcoinCliArgs({ prune: opts.prune }),
    '-rpcconnect=127.0.0.1',
    '-rpcwait',
    '-rpcclienttimeout=0',
    ...cmd,
  ])
  if (res.exitCode !== 0) {
    throw new Error(
      `bitcoin-cli ${cmd[0]} failed (${res.exitCode}): ${String(res.stderr)}`,
    )
  }
  return String(res.stdout)
}

const cliJson = async <T>(
  subc: CliRunner,
  opts: { prune: boolean },
  ...cmd: string[]
): Promise<T> => JSON.parse(await cli(subc, opts, ...cmd)) as T

/**
 * Whether the running binary is an RDTS-enforcing build. getdeploymentinfo
 * lists every deployment compiled into the binary's chain params regardless
 * of BIP9 status, so `reduced_data` is present on any build that defines it —
 * the RUNTIME_WARN Knots release, which enforces on mainnet from first start —
 * and absent on builds that never define it (Bitcoin Core; the pre-RDTS Knots
 * release that predates the deployment). Presence is thus a valid enforcement
 * signal for the RDTS build and does NOT depend on `consensusrules` (that
 * option records consent and silences a warning; it does not gate
 * enforcement). Never-enforcing flavors MUST hardcode false — they cannot
 * derive it. Keying on presence, never `dep.active`, is deliberate: a fresh
 * RDTS-flavor install before "Activate RDTS" is acknowledged still enforces
 * and must read as such.
 */
export async function getRdtsDeployment(
  subc: CliRunner,
  opts: { prune: boolean },
): Promise<RdtsDeployment | undefined> {
  const info = await cliJson<GetDeploymentInfo>(subc, opts, 'getdeploymentinfo')
  return info.deployments['reduced_data']
}

/**
 * The height to anchor RDTS re-validation at: the lowest of the hardcoded
 * mandatory-signaling start, the same figure derived entirely from the
 * node's own deployment params (max_activation_height − 2 × signaling
 * window; both must come from the node — mixing a node-reported
 * max_activation with a hardcoded window is only coincidentally right on
 * mainnet), and the node-reported first enforced height (present once the
 * deployment is active). Lower anchors only widen the replay; the result
 * is floored at 1 so a pathological params combination can never produce
 * an unusable height.
 */
export function rdtsAnchorHeight(dep: RdtsDeployment | undefined): number {
  const candidates = [RDTS_FIRST_APPLICABLE_HEIGHT]
  const max = dep?.bip9?.max_activation_height
  const period = dep?.bip9?.statistics?.period
  if (typeof max === 'number' && typeof period === 'number') {
    candidates.push(max - 2 * period)
  }
  if (typeof dep?.height === 'number') candidates.push(dep.height)
  return Math.max(1, Math.min(...candidates))
}

export type ReconsiderResult = {
  /** Tips whose failure flags were cleared. */
  reconsidered: ChainTip[]
  /** Invalid tips left alone: reorganizing onto them would disconnect
   *  active-chain blocks below the prune horizon, which bitcoind treats as
   *  a fatal error mid-reorg (node shutdown). */
  skippedPruned: ChainTip[]
}

/**
 * Clear persisted invalid-block verdicts on every invalid chain tip
 * (`reconsiderblock`), so the node re-evaluates those branches under the
 * *running* binary's rules and follows the best chain valid under them.
 * `reconsiderblock` clears BLOCK_FAILED_* on the block, its ancestors, and
 * its descendants (persisted), then ActivateBestChain re-connects through
 * full ConnectBlock validation — genuinely-invalid branches are re-marked
 * on reconnection. Clean no-op when there are no invalid tips.
 *
 * Pruning guard: reorganizing onto a reconsidered branch means
 * disconnecting the active chain down to the fork point (tip.height −
 * branchlen). A pruned node that no longer stores blocks down to that
 * height would hit a fatal disconnect failure during the reorg, so such
 * tips are reported in `skippedPruned` instead of reconsidered — recovery
 * for them is a full reindex (a re-download on pruned nodes). Residual
 * hazard the guard cannot close: when the reconsidered branch's data must
 * still be fetched from peers, the reorg happens later, and pruning may
 * advance past the fork point in the interim — an upstream
 * reconsiderblock hazard no pre-check can eliminate; user docs route a
 * stuck pruned node to Reindex Blockchain.
 */
export async function reconsiderInvalidTips(
  subc: CliRunner,
  opts: { prune: boolean },
): Promise<ReconsiderResult> {
  const result: ReconsiderResult = { reconsidered: [], skippedPruned: [] }
  // Re-fetch tips and chain info every iteration: each reconsiderblock can
  // reorg the active chain synchronously, which changes every other tip's
  // branchlen/fork-point math (and a genuinely-invalid tip re-flags itself
  // after its failed reconnection — the attempted-set stops us retrying it).
  const attempted = new Set<string>()
  while (true) {
    const tips = await cliJson<ChainTip[]>(subc, opts, 'getchaintips')
    const tip = tips.find(
      (t) => t.status === 'invalid' && !attempted.has(t.hash),
    )
    if (!tip) return result
    attempted.add(tip.hash)

    const info = await cliJson<GetBlockchainInfo>(
      subc,
      opts,
      'getblockchaininfo',
    )
    const forkHeight = tip.height - tip.branchlen
    // Skip only when the block at forkHeight+1 — the lowest block a reorg
    // onto this tip must disconnect and re-connect — has itself been pruned.
    // At pruneheight == forkHeight+1 that block is still stored, so the reorg
    // is feasible; the guard is `> forkHeight + 1`, not `> forkHeight`, to
    // avoid over-skipping that boundary into a spurious "not recoverable"
    // reindex warning.
    if (info.pruned && (info.pruneheight ?? 0) > forkHeight + 1) {
      result.skippedPruned.push(tip)
      continue
    }
    await cli(subc, opts, 'reconsiderblock', tip.hash)
    result.reconsidered.push(tip)
  }
}

export type RevalidateResult =
  /** Chain has not reached the RDTS-applicable range: every applicable block
   *  will be validated under the active rules as it connects, so there is
   *  nothing to re-validate. */
  | { outcome: 'not-applicable'; blocks: number }
  /** The applicable range cannot be replayed locally (data pruned away, or
   *  the chainstate rests on an assumeutxo snapshot that is not yet fully
   *  validated). Only a full reindex — a chain re-download on pruned
   *  nodes — re-validates it. */
  | { outcome: 'requires-reindex'; reason: 'pruned' | 'assumeutxo' }
  /** The range was disconnected and replayed under the active RDTS rules. */
  | {
      outcome: 'revalidated'
      fromHeight: number
      tipBefore: string
      tipAfter: string
    }

/**
 * Re-validate every block from `anchorHeight` (see rdtsAnchorHeight) under
 * the now-active RDTS rules: `invalidateblock` the block at that height
 * (rolls the chain back to its parent), then `reconsiderblock` it (clears
 * the failure flags and lets ActivateBestChain reconnect the whole range
 * through ConnectBlock, where all BIP-110 checks live). Any block that
 * violates RDTS is re-marked invalid during the replay and the node settles
 * on the best RDTS-valid chain — whether the divergence is at the anchor
 * height or later.
 *
 * The invalidate→reconsider pair is idempotent and interruption-safe: if
 * stopped between the two calls the node is left parked below the anchor
 * with the old chain still marked invalid. The below-anchor gate therefore
 * distinguishes that parked state from a chain that never reached the
 * range: any invalid branch extending to or past the anchor is reconsidered
 * (its reconnection under the active rules IS the re-validation) before
 * `not-applicable` can be returned.
 *
 * Pruning guard: disconnecting [anchor, tip] requires block and undo data
 * down to the anchor. bitcoind has no such pre-check of its own — an
 * invalidateblock into pruned data silently stops at the prune horizon,
 * reporting success while leaving a partial rollback — so callers must
 * never reach that state: when pruneheight > anchor this returns
 * `requires-reindex` without touching anything, and the rollback is
 * re-verified after invalidateblock in case pruning advanced past the
 * anchor between the gate check and the call (partial rollbacks are healed
 * with a reconsiderblock before falling back to reindex). Same for a
 * not-yet-validated assumeutxo chainstate, which lacks undo data at and
 * below its snapshot base.
 */
export async function revalidateAgainstRdts(
  subc: CliRunner,
  opts: { prune: boolean },
  anchorHeight: number,
  /** Invoked once all gates pass and the (possibly long) replay is about to
   *  begin — the hook for a user-facing "started" notification. */
  onReplayStart?: () => Promise<void>,
): Promise<RevalidateResult> {
  const info = await cliJson<GetBlockchainInfo>(subc, opts, 'getblockchaininfo')
  if (info.blocks < anchorHeight) {
    // Distinguish "never reached the range" from "parked below the anchor
    // by an interrupted invalidate→reconsider pair": recover any invalid
    // branch reaching into the RDTS range before declaring nothing to do.
    // Tips and chain info are re-fetched every iteration for the same
    // reason reconsiderInvalidTips does: each reconsiderblock can reorg
    // the chain and advance the prune horizon, invalidating earlier
    // fork-point math.
    const attempted = new Set<string>()
    let sawParked = false
    let reconsidered = 0
    let replayStarted = false
    while (true) {
      const tips = await cliJson<ChainTip[]>(subc, opts, 'getchaintips')
      const tip = tips.find(
        (t) =>
          t.status === 'invalid' &&
          t.height >= anchorHeight &&
          !attempted.has(t.hash),
      )
      if (!tip) break
      sawParked = true
      attempted.add(tip.hash)

      const cur = await cliJson<GetBlockchainInfo>(
        subc,
        opts,
        'getblockchaininfo',
      )
      const forkHeight = tip.height - tip.branchlen
      // Parked recovery is a pure forward connect of [anchor, tip] (the fork
      // point is anchor-1, so nothing is disconnected); it only needs block
      // data from forkHeight+1 up. Skip only when that block is pruned —
      // `> forkHeight + 1`, not `> forkHeight`, so the pruneheight == anchor
      // boundary is not over-skipped into a spurious critical reindex task.
      if (cur.pruned && (cur.pruneheight ?? 0) > forkHeight + 1) continue
      if (!replayStarted) {
        replayStarted = true
        await onReplayStart?.()
      }
      await cli(subc, opts, 'reconsiderblock', tip.hash)
      reconsidered++
    }
    if (!sawParked) {
      return { outcome: 'not-applicable', blocks: info.blocks }
    }
    if (!reconsidered) return { outcome: 'requires-reindex', reason: 'pruned' }
    const healed = await cliJson<GetBlockchainInfo>(
      subc,
      opts,
      'getblockchaininfo',
    )
    return {
      outcome: 'revalidated',
      fromHeight: anchorHeight,
      tipBefore: info.bestblockhash,
      tipAfter: healed.bestblockhash,
    }
  }
  const states = await cliJson<GetChainStates>(subc, opts, 'getchainstates')
  if (states.chainstates.some((c) => c.snapshot_blockhash && !c.validated)) {
    return { outcome: 'requires-reindex', reason: 'assumeutxo' }
  }
  if (info.pruned && (info.pruneheight ?? 0) > anchorHeight) {
    return { outcome: 'requires-reindex', reason: 'pruned' }
  }

  const anchor = (
    await cli(subc, opts, 'getblockhash', String(anchorHeight))
  ).trim()
  await cli(subc, opts, 'invalidateblock', anchor)
  // Verify the rollback actually disconnected the anchor. A tip still at or
  // above the anchor is fine when the active chain no longer CONTAINS the
  // invalidated anchor block — that means ActivateBestChain just connected
  // a sibling branch (forking below the anchor) through full ConnectBlock
  // validation under the active rules, which is a successful outcome. But
  // if the anchor block itself is still in the active chain, the disconnect
  // walk silently stopped at the prune horizon (pruning advanced between
  // the gate check and the call): heal the partial rollback and fall back
  // to reindex rather than reporting a re-validation that never happened.
  const rolled = await cliJson<GetBlockchainInfo>(
    subc,
    opts,
    'getblockchaininfo',
  )
  if (
    rolled.blocks >= anchorHeight &&
    (await cli(subc, opts, 'getblockhash', String(anchorHeight))).trim() ===
      anchor
  ) {
    await cli(subc, opts, 'reconsiderblock', anchor)
    return { outcome: 'requires-reindex', reason: 'pruned' }
  }
  // The pruned-race heal path is ruled out; the (possibly long) reconsider
  // replay is about to begin. Fire onReplayStart here — not before
  // invalidateblock — so a heal-path fallthrough cannot emit a "started"
  // notification that never gets a matching "complete".
  await onReplayStart?.()
  try {
    await cli(subc, opts, 'reconsiderblock', anchor)
  } catch {
    // The node is parked below the anchor with an invalid-marked chain.
    // One retry; if it still fails the caller keeps the store flag set and
    // the next start recovers through the parked-state path above.
    await cli(subc, opts, 'reconsiderblock', anchor)
  }
  const after = await cliJson<GetBlockchainInfo>(
    subc,
    opts,
    'getblockchaininfo',
  )
  return {
    outcome: 'revalidated',
    fromHeight: anchorHeight,
    tipBefore: info.bestblockhash,
    tipAfter: after.bestblockhash,
  }
}
