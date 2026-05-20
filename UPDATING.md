# Updating the upstream version

The `bitcoind` image is built locally from `Dockerfile`: it downloads the upstream Guix-built release tarball from `bitcoincore.org`, verifies `SHA256SUMS.asc` against a pinned 5-of-7 quorum of Bitcoin Core release signers, and copies the binaries into a slim Debian runtime. This branch tracks **Bitcoin Core 28.x** releases only.

## Determining the upstream version

- **Bitcoin Core 28.x** — [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin)
  - Latest 28.x release tag:
    ```sh
    gh release list -R bitcoin/bitcoin --limit 50 --json tagName -q '.[].tagName' | grep -E '^v28\.' | head -1
    ```
  - Current pin: `VERSION` build-arg under `images.bitcoind.source.dockerBuild.buildArgs` in `startos/manifest/index.ts`.

## Applying the bump

1. Bump `VERSION` in `startos/manifest/index.ts` under `images.bitcoind.source.dockerBuild.buildArgs`.
2. If upstream rotated release signers, update `PINNED_FINGERPRINTS` in `Dockerfile` and refresh the keys in `assets/release-keys/`.

> All four major-version branches share the same StartOS `:N` revision suffix — when you bump it on one branch, bump it on the others too.
