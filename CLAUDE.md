# CLAUDE.md

See [CONTRIBUTING.md](CONTRIBUTING.md) for the doc map and contribution workflow.

## Operating rules

- **Multi-branch repo.** One branch per Bitcoin Core major: `28.x`, `29.x`, `30.x`, `31.x` (`31.x` is primary). Structural changes — SDK bumps, shared scaffolding, doc rewrites — must be applied to every branch, and all four share the same StartOS `:N` revision suffix (bump them in tandem).
- **`bitcoind` is built locally.** `Dockerfile` downloads the upstream Guix-built release from `bitcoincore.org/bin/bitcoin-core-${VERSION}/`, verifies `SHA256SUMS.asc` against the pinned 5-of-7 quorum in `PINNED_FINGERPRINTS` (keys in `assets/release-keys/`), and copies `bin/bitcoind`, `bin/bitcoin-cli`, and `libexec/bitcoin-node` into a slim Debian runtime.
- **IPC is 31.x-only** — it needs `libexec/bitcoin-node` from the upstream tarball, which only 31.x ships; 28/29/30 have no IPC action.
- **Sidecar images** — `btc-rpc-proxy`, `python` (Alpine), and `i2pd` are pulled by tag in `startos/manifest/index.ts`; bump them there.
