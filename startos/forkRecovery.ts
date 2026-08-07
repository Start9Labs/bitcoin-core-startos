import { GetBlockchainInfo, bitcoinCliArgs } from './utils'

/**
 * Chain-split recovery for the shared `bitcoind` datadir. Shared across every
 * bitcoind flavor's repo — keep the copies in sync; only the callers differ.
 *
 * All bitcoind flavors (Bitcoin Core, Bitcoin Knots pre-RDTS, Bitcoin Knots
 * RDTS) share one package id and one data volume, so a flavor switch carries
 * the source flavor's persisted per-block validity verdicts
 * (CBlockIndex::nStatus, serialized in blocks/index/) into the destination
 * binary. Those verdicts are trusted verbatim on startup — bitcoind never
 * re-validates buried blocks under the new binary's rules, and the persisted
 * validity level does not record which consensus rules produced it. Around a
 * contentious BIP-110 (RDTS) chain split that inheritance would make the node
 * follow the wrong chain in both directions. The two directions are fixed in
 * different places:
 *
 * - Leaving enforcement (switching to Core / pre-RDTS Knots): RDTS-driven
 *   BLOCK_FAILED_VALID marks persist, so the non-enforcing flavor refuses
 *   the most-work chain it would otherwise follow. The destination binary
 *   knows nothing about RDTS and cannot recognize those verdicts as foreign,
 *   so the package clears them: `reconsiderblock` each invalid chain tip
 *   (reconsiderInvalidTips), run by the flavor being switched *to*.
 * - Entering enforcement (switching to RDTS Knots, or a package update that
 *   moves the pin from a pre-RDTS to an RDTS release): blocks connected
 *   while enforcement was off are cache-valid and never re-checked against
 *   RDTS. Knots ≥ 29.4 re-validates the RDTS-applicable range itself at
 *   startup, so the package does nothing here.
 *
 * Enforcement model: whether a node enforces RDTS is a property of the
 * running *binary*, not of configuration. The RDTS-enforcing flavor pins an
 * official Knots release built with RDTS_CONSENT=RUNTIME_WARN
 * (contrib/guix/libexec/build.sh), which enforces on mainnet from its first
 * start regardless of `consensusrules` — that option records user consent
 * (and silences an hourly warning), it does not gate enforcement. Bitcoin
 * Core and pre-RDTS Knots binaries never enforce. Callers therefore derive
 * enforcement from the node itself via isRdtsEnforcing (never-enforcing
 * flavors may hardcode false), and every flavor's main.ts records it in the
 * `rdtsEnforcedLastRun` store marker each start, treating a change as a
 * switch between enforcement regimes. That marker is what tells the
 * *non*-enforcing flavors that the verdicts they inherited are foreign, so
 * every flavor must keep writing it — including the enforcing one, which
 * never acts on it itself.
 *
 * The remedy is a safe no-op when there is nothing to fix, and self-heals: a
 * reconsidered block that is still invalid under the running rules is simply
 * re-marked invalid when its reconnection is attempted, and the node settles
 * on the best remaining valid chain.
 */

/** A container that can run bitcoin-cli against the live bitcoind. */
export type CliRunner = {
  exec: (cmd: string[]) => Promise<{
    exitCode: number | null
    stdout: string | Buffer
    stderr: string | Buffer
  }>
}

export type GetDeploymentInfo = {
  hash: string
  height: number
  deployments: Record<string, unknown>
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
 * derive it. Keying on presence, never the deployment's `active` field, is
 * deliberate: a fresh RDTS-flavor install before "Activate RDTS" is
 * acknowledged still enforces and must read as such.
 */
export async function isRdtsEnforcing(
  subc: CliRunner,
  opts: { prune: boolean },
): Promise<boolean> {
  const info = await cliJson<GetDeploymentInfo>(subc, opts, 'getdeploymentinfo')
  return info.deployments['reduced_data'] !== undefined
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
