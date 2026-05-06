## How the upstream version is pulled

- Image `bitcoind` is built by `Dockerfile`, which downloads the upstream Guix-attested release from `bitcoincore.org/bin/bitcoin-core-${VERSION}/`
- Bumping upstream: update `VERSION` in `startos/manifest/index.ts` (`images.bitcoind.source.dockerBuild.buildArgs`) and rename the version file `startos/versions/v<X.Y>.<N>.ts` in place
- The Dockerfile pins 7 Bitcoin Core release-signer fingerprints with a 5-of-7 quorum requirement on `SHA256SUMS.asc`. Update `PINNED_FINGERPRINTS` if upstream rotates signers
- IPC was removed in `:10` (was non-functional dead code on this branch — upstream tarball doesn't ship `bitcoin-node`); users needing IPC should run 31.x

> Has sidecar images (btc-rpc-proxy, python, i2pd) with their own version tags in manifest.
