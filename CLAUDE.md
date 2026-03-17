## How the upstream version is pulled

- Git submodule `bitcoin/` → checkout new tag
- Image `bitcoind` is `dockerBuild` from root (no dockerTag to update)

> Has sidecar images (btc-rpc-proxy, python, i2pd) with their own version tags in manifest.
