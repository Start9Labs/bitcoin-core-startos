# Updating the upstream version

The `bitcoind` image is built from `Dockerfile`, which downloads the upstream release tarball from `bitcoincore.org` and verifies `SHA256SUMS.asc` against the release signers pinned in `PINNED_FINGERPRINTS`. This branch tracks **Bitcoin Core 31.x** releases only.

## Determining the upstream version

- **Bitcoin Core 31.x** — [bitcoin/bitcoin](https://github.com/bitcoin/bitcoin)
  - Latest 31.x release tag:
    ```sh
    gh release list -R bitcoin/bitcoin --limit 50 --json tagName -q '.[].tagName' | grep -E '^v31\.' | head -1
    ```
  - Current pin: `VERSION` build-arg under `images.bitcoind.source.dockerBuild.buildArgs` in `startos/manifest/index.ts`.

## The i2pd image

Pinned as `images.i2pd.source.dockerTag` in `startos/manifest/index.ts`: `purplei2p/i2pd:release-<version>` on Docker Hub. Releases are at <https://github.com/PurpleI2P/i2pd/releases>.

The service-log filter's drop list (`startos/i2pdLogFilter.ts`) is transcribed verbatim from the pinned i2pd image's message wording, so an `i2pd` image bump can reword those messages. Fold any reworded families back into the list and its test corpus (`test/i2pdLogFilter.test.ts`). The filter and its test ship verbatim in the Knots repos — update all three together.

## Applying the bump

1. Bump `VERSION` in `startos/manifest/index.ts` under `images.bitcoind.source.dockerBuild.buildArgs`.
2. If upstream rotated release signers, update `PINNED_FINGERPRINTS` in `Dockerfile` and refresh the keys in `assets/release-keys/`.
