# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **Multi-branch package.** Each upstream major line lives on its own branch, checked out as a git worktree under the parent directory — `git worktree list` enumerates them. Consider every maintained worktree for any change, not just the one you are in. Release notes may legitimately differ per branch; structural changes should not.
- **Package id is `bitcoind`, not `bitcoin-core`.** The repo and directory are named after the flavor, but `effects` calls, dependents, and `start-cli` all take `bitcoind`.
- **`startos/utils.ts`, `startos/manifest`, and the action ids are a public API.** Fifteen sibling packages import host ids and ports from `utils` (`rpcHostId`, `rpcPort`, `peerLocalHostId`, `peerPortLocal`, `zmqHostId`, the zmq ports, `rpccookiefile`), and nine drive `autoconfig` by id. Renaming or moving one breaks their builds or their tasks — grep both registries before you do.
- **`startos/forkRecovery.ts` is shared verbatim with every other bitcoind flavor's repo; only the callers differ.** A change here needs the same change in the Knots repos. For the same reason, never drop a key from `store.json`'s shape because this flavor does not act on it: all flavors share one store, and dropping the declaration would discard another flavor's pending state on a switch.
- **`startos/i2pdLogFilter.ts` and `test/i2pdLogFilter.test.ts` are shared verbatim with the Knots repos**, like `forkRecovery.ts` — edit all three trees together. `npm test` runs the suite and is chained into `npm run check`, so `make` and CI gate on it. The drop list is keyed to the pinned i2pd image's exact message wording; read UPDATING.md's i2pd section before bumping that image.
- **`fullConfigSpec` has three hand-maintained halves and no exhaustiveness check.** A new setting must be added to `shape`, `fileToForm`, and `formToFile` in `startos/fileModels/bitcoin.conf.ts` — TypeScript will not tell you one is missing. Then select it in one of the four config actions' `filter({…})`; a field no action selects is unreachable from the UI.
