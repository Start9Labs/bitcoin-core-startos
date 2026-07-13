# Updating the upstream version

The `bitcoind` image is built locally from `Dockerfile`: it downloads the upstream Guix-built release tarball from `bitcoincore.org`, verifies `SHA256SUMS.asc` against a pinned 5-of-7 quorum of Bitcoin Core release signers, and copies the binaries into a slim Debian runtime. This branch tracks **Bitcoin Core 31.x** releases only.

## Determining the upstream version

- **Bitcoin Core 31.x** — [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin)
  - Latest 31.x release tag:
    ```sh
    gh release list -R bitcoin/bitcoin --limit 50 --json tagName -q '.[].tagName' | grep -E '^v31\.' | head -1
    ```
  - Current pin: `VERSION` build-arg under `images.bitcoind.source.dockerBuild.buildArgs` in `startos/manifest/index.ts`.

## Applying the bump

1. Bump `VERSION` in `startos/manifest/index.ts` under `images.bitcoind.source.dockerBuild.buildArgs`.
2. If upstream rotated release signers, update `PINNED_FINGERPRINTS` in `Dockerfile` and refresh the keys in `assets/release-keys/`.

> **On an upstream bump, the `:N` revision resets to `0` on that branch alone** (`29.3:13` → `29.4:0`). Do not try to carry `:N` across branches on an upstream bump — a branch with no new upstream release cannot follow without moving backwards.
>
> The `:N` suffixes are shared only for a **downstream-only** change that lands on every branch at once (an SDK bump, a shared fix). Even then they drift apart as soon as one branch takes an upstream release the others do not, and the published history shows exactly that (`31.0` reached `:14` while `28.4` stopped at `:12`). Read each branch's current version rather than assuming they match.
