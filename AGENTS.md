# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Multi-branch package.** Each upstream major line lives on its own branch, checked out as a git worktree under the parent directory — `git worktree list` enumerates them. Consider every maintained worktree for any change, not just the one you are in. Release notes may legitimately differ per branch; structural changes should not.
- **Package id is `bitcoind`, not `bitcoin-core`.** The repo and directory are named after the flavor, but `effects` calls, dependents, and `start-cli` all take `bitcoind`.
- **`startos/utils.ts`, `startos/manifest`, and the action ids are a public API.** Fifteen sibling packages import host ids and ports from `utils` (`rpcHostId`, `rpcPort`, `peerLocalHostId`, `peerPortLocal`, `zmqHostId`, the zmq ports, `rpccookiefile`), and nine drive `autoconfig` by id. Renaming or moving one breaks their builds or their tasks — grep both registries before you do.
- **`startos/forkRecovery.ts` is shared verbatim with every other bitcoind flavor's repo; only the callers differ.** A change here needs the same change in the Knots repos. For the same reason, never drop a key from `store.json`'s shape because this flavor does not act on it: all flavors share one store, and dropping the declaration would discard another flavor's pending state on a switch.
- **`fullConfigSpec` has three hand-maintained halves and no exhaustiveness check.** A new setting must be added to `shape`, `fileToForm`, and `formToFile` in `startos/fileModels/bitcoin.conf.ts` — TypeScript will not tell you one is missing. Then select it in one of the four config actions' `filter({…})`; a field no action selects is unreachable from the UI.
