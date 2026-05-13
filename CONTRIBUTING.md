# Contributing

This repo packages [Bitcoin Core](https://github.com/bitcoin/bitcoin) for StartOS. It ships one branch per supported Bitcoin Core major version — `28.x`, `29.x`, `30.x`, `31.x` — with `31.x` as the primary/default. Target the branch for the major version you're changing; structural changes (SDK bumps, shared scaffolding, doc rewrites) generally need to be applied to every branch.

## Documentation — keep it in sync

- **`README.md`** — what this package is and how it's built (image, volumes, interfaces, actions, defaults). For developers and AI assistants.
- **`instructions.md`** — the user-facing instructions packed into the `.s9pk` and shown on the **Instructions** tab in StartOS, for the person running the node.
- **`CONTRIBUTING.md`** — this file.
- **`CLAUDE.md`** — operating rules for AI developers working in this repo.

**Any code change that warrants it must update `README.md` and `instructions.md` in the same change** — a new or renamed action, an added or removed volume / port / interface / dependency, a changed default, a new limitation, any altered user-visible behavior. Don't defer: a package that ships with a stale README or stale instructions is not done, even if the code is perfect. Content rules live in the packaging guide: [Writing READMEs](https://docs.start9.com/packaging/writing-readmes.html) and [Writing Service Instructions](https://docs.start9.com/packaging/writing-instructions.html).

## Building

See the [StartOS Packaging Guide](https://docs.start9.com/packaging/) for environment setup, then:

```bash
npm ci    # install dependencies
make      # build the universal .s9pk
```

The `bitcoind` image is built locally from `Dockerfile`: it downloads the upstream Guix-built release tarball from `bitcoincore.org`, verifies `SHA256SUMS.asc` against a pinned 5-of-7 quorum of Bitcoin Core release signers, and copies the binaries into a slim Debian runtime.

## Updating the upstream Bitcoin Core version

1. Bump `VERSION` in `startos/manifest/index.ts` under `images.bitcoind.source.dockerBuild.buildArgs`.
2. Rename the version file under `startos/versions/` to the new version string and update its `version` and `releaseNotes`. A *new* version file is only needed when the bump carries an `up`/`down` migration, or when you want the old release notes preserved in git history — see [Versions](https://docs.start9.com/packaging/versions.html).
3. If upstream rotated release signers, update `PINNED_FINGERPRINTS` in `Dockerfile` and refresh the keys in `assets/release-keys/`.
4. Rebuild (`make`), sideload the `.s9pk`, and confirm the node starts and syncs.
5. Review `README.md` and `instructions.md` for anything the bump changed.

> All four major-version branches share the same StartOS `:N` revision suffix — when you bump it on one branch, bump it on the others too.

## How to contribute

1. Fork the repository and create a branch from the major-version branch you're targeting.
2. Make your changes — including the doc updates above.
3. Open a pull request to that branch.
