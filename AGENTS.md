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
`instructions.md` (end-user docs) in sync with your changes. This file restates neither:
whoever changes the package has both, so it carries only what they don't — repo mechanics,
a change that looks right and is not, where the next thing gets added, a naming trap, a
build or test invocation particular to this repo.

**Fix a defect you spot rather than reporting it** — you have the package open and the
context to be sure. File **a GitHub issue on this repo** only when the call isn't yours to
make: you can't pin the cause down, two defensible fixes exist, or it's too large to ride on
the work in hand. An open issue is a report, not a queue — implement one when you're asked
to or when it's labelled `Approved`, then close it with `Closes #<n>`.

Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **Multi-branch package.** Each upstream major line lives on its own branch, checked out as a git worktree under the parent directory — `git worktree list` enumerates them. Consider every maintained worktree for any change, not just the one you are in. Release notes may legitimately differ per branch; structural changes should not.
- **Package id is `bitcoind`, not `bitcoin-core`.** The repo and directory are named after the flavor, but `effects` calls, dependents, and `start-cli` all take `bitcoind`.
- **`startos/utils.ts`, `startos/manifest`, and the action ids are a public API.** Sibling packages import host ids and ports from `utils` (`rpcHostId`, `rpcPort`, `peerLocalHostId`, `peerPortLocal`, `zmqHostId`, the zmq ports, `rpccookiefile`), and several drive `autoconfig` by id. Renaming or moving one breaks their builds or their tasks — grep both registries before you do.
- **`store.json` stays `z.looseObject`.** All bitcoind flavors share one store, and a strict shape would discard another flavor's pending state on a switch.
- **`startos/i2pdLogFilter.ts` and `test/i2pdLogFilter.test.ts` are shared verbatim with the Knots repos** — edit all three trees together. `npm test` runs the suite, and the Makefile's `TS_CHECK` override chains it into the build gate, so `make` and CI fail on it. The drop list is keyed to the pinned i2pd image's exact message wording; read UPDATING.md's i2pd section before bumping that image.
- **`fullConfigSpec` has three hand-maintained halves and no exhaustiveness check.** A new setting must be added to `shape`, `fileToForm`, and `formToFile` in `startos/fileModels/bitcoin.conf.ts` — TypeScript will not tell you one is missing. Then select it in one of the four config actions' `filter({…})`; a field no action selects is unreachable from the UI.
- **`setInterfaces` must not drop RPC and peer along with the conf.** Only the ZMQ and I2P exports read `bitcoin.conf`; an early return on a null read de-exports every interface, and every dependent that watches this host sees them all vanish at once. A torn write is a real way to read null (Start9Labs/start-technologies#3668).
