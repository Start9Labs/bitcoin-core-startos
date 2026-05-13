# CLAUDE.md

See [CONTRIBUTING.md](CONTRIBUTING.md) for the doc map and contribution workflow.

## Operating rules

- **Multi-branch repo.** One branch per Bitcoin Core major: `28.x`, `29.x`, `30.x`, `31.x` (`31.x` is primary). Structural changes — SDK bumps, shared scaffolding, doc rewrites — must be applied to every branch, and all four share the same StartOS `:N` revision suffix (bump them in tandem).
- **`bitcoind` is built locally.** `Dockerfile` downloads the upstream Guix-built release from `bitcoincore.org/bin/bitcoin-core-${VERSION}/`, verifies `SHA256SUMS.asc` against the pinned 5-of-7 quorum in `PINNED_FINGERPRINTS` (keys in `assets/release-keys/`), and copies `bin/bitcoind` and `bin/bitcoin-cli` into a slim Debian runtime.
- **No IPC on this branch** — the upstream tarball doesn't ship `bitcoin-node`; the dead IPC plumbing was removed in `:10`. Run 31.x if you need IPC.
- **Sidecar images** — `btc-rpc-proxy`, `python` (Alpine), and `i2pd` are pulled by tag in `startos/manifest/index.ts`; bump them there.
