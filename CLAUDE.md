## How the upstream version is pulled

- Image `bitcoind` is built by `Dockerfile`, which downloads the upstream Guix-attested release from `bitcoincore.org/bin/bitcoin-core-${VERSION}/`
- Bumping upstream: update `VERSION` in `startos/manifest/index.ts` (`images.bitcoind.source.dockerBuild.buildArgs`) and rename the version file `startos/versions/v<X.Y>.<N>.ts` in place
- The Dockerfile pins 7 Bitcoin Core release-signer fingerprints with a 5-of-7 quorum requirement on `SHA256SUMS.asc`. Update `PINNED_FINGERPRINTS` if upstream rotates signers
- Copies `bin/bitcoind`, `bin/bitcoin-cli`, and `libexec/bitcoin-node` (the latter for the IPC feature, which is 31.x-only)

> Has sidecar images (btc-rpc-proxy, python, i2pd) with their own version tags in manifest.
