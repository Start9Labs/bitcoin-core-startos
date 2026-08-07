# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Multi-branch package.** Bitcoin Core ships parallel major-version lines as git worktrees — `28.x`, `29.x`, `30.x`, `31.x` — grouped under the parent dir. Any change (version bump, dependency refresh, SDK migration) must be considered for _every_ maintained worktree, not just the one you're in. Run `git worktree list` to enumerate.
- **Package id is `bitcoind`** (not `bitcoin-core`); dependents and `effects` calls reference it by that id.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep `debug.log`), use `start-cli package attach bitcoind -n <subcontainer-name> -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name. A service with more than one subcontainer requires a selector.
