<p align="center">
  <img src="icon.svg" alt="Bitcoin Core Logo" width="21%">
</p>

# Bitcoin Core on StartOS

> **Upstream docs:** <https://bitcoincore.org/en/doc/>
>
> Everything not listed in this document should behave the same as upstream
> Bitcoin Core v30.2. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

The reference implementation of the Bitcoin protocol. See the [upstream repo](https://github.com/bitcoin/bitcoin) for general Bitcoin Core documentation.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Default Networking](#default-networking)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                                       |
| ------------- | --------------------------------------------------------------------------- |
| Image         | Custom Dockerfile (multi-stage Alpine build from Bitcoin Core v30.2 source) |
| Architectures | x86_64, aarch64, riscv64                                                    |
| Entrypoint    | `bitcoind` (or `/opt/bitcoin/libexec/bitcoin-node` when IPC is enabled)     |

The custom Dockerfile cross-compiles Bitcoin Core with ZMQ support (`-DWITH_ZMQ=ON`), IPC support (`-DENABLE_IPC=ON` via Cap'n Proto), and adds runtime utilities (curl, yq, jq, tini).

Three additional containers are used:

| Container | Image                              | Purpose                                       |
| --------- | ---------------------------------- | --------------------------------------------- |
| `proxy`   | `ghcr.io/start9labs/btc-rpc-proxy` | RPC proxy for pruned nodes                    |
| `python`  | `python:3.13.11-alpine`            | Runs `rpcauth.py` to generate RPC credentials |
| `i2pd`    | `purplei2p/i2pd:release-2.58.0`    | Embedded I2P daemon (when enabled)            |

## Volume and Data Layout

| Volume | Mount Point      | Purpose                                             |
| ------ | ---------------- | --------------------------------------------------- |
| `main` | `/root/.bitcoin` | All Bitcoin Core data (blockchain, config, wallets) |
| `i2pd` | `/home/i2pd`     | I2P daemon data (when embedded I2P is enabled)      |

StartOS-specific files on the `main` volume:

| File         | Purpose                                                                       |
| ------------ | ----------------------------------------------------------------------------- |
| `store.json` | Persistent StartOS state (reindex flags, sync status, IPC toggle, wantsOnion) |

Blockchain data directories (`blocks/`, `chainstate/`, `indexes/`) reside on the `main` volume alongside the standard `bitcoin.conf` and `.cookie` files.

## Installation and First-Run Flow

1. On install, StartOS sets the `nocow` attribute on the data directory (btrfs optimization via `chattr -R +C`)
2. Default `bitcoin.conf` and `store.json` are written with defaults mostly aligned with upstream, plus some optimizations for typical StartOS hardware and ecosystem needs (e.g. larger `dbcache`, ZMQ and block filter index pre-enabled for dependent services)
3. **Disk-aware defaults**: on disks smaller than 900 GB, pruning is automatically enabled (550 MiB target) and `txindex` is disabled; on larger disks, a full archival node is configured by default
4. **I2P enabled by default**: the embedded I2P daemon starts automatically with `i2pacceptincoming=true`, so the node accepts inbound peer connections over I2P out of the box — no user configuration required
5. **Tor proxy always configured**: the `-onion` flag is set to the StartOS Tor proxy on every start, enabling outbound connections over Tor. To additionally advertise a public address (clearnet IP or Tor onion), use the **Peer Settings** action
6. Bitcoin Core begins syncing the blockchain (Initial Block Download)

## Default Networking

Out of the box, Bitcoin Core on StartOS connects to the Bitcoin network over multiple transports with no user configuration required:

| Transport     | Default                                   | Inbound                             | How to change                                       |
| ------------- | ----------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| **I2P**       | Enabled (embedded `i2pd` SAM proxy)       | Accepted (`i2pacceptincoming=true`) | Peer Settings → I2P SAM Proxy → Disabled            |
| **Tor**       | Outbound via StartOS Tor proxy (`-onion`) | No (no onion address advertised)    | Peer Settings → Public Address → Create Tor Address |
| **IPv4/IPv6** | Enabled (clearnet peer discovery)         | No (`externalip` not set)           | Peer Settings → Public Address → select a public IP |
| **BIP324 v2** | Enabled (`v2transport=true`)              | —                                   | Peer Settings → Use V2 P2P Transport Protocol       |

To restrict outbound connections to specific networks only, use the **onlynet** setting in Peer Settings.

The I2P web console is disabled by default. It can be enabled via advanced i2pd settings in Peer Settings (when I2P is enabled).

## Configuration Management

Bitcoin Core is configured through **StartOS actions** that write to `bitcoin.conf` (INI format) on the `main` volume.

### Configuration Actions

| Action               | Settings                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mempool Settings** | persistmempool, maxmempool, mempoolexpiry, permitbaremultisig, OP_RETURN (datacarrier/datacarriersize)                                                                                           |
| **Peer Settings**    | onlynet (ipv4/ipv6/onion/i2p/cjdns), BIP324 v2transport, I2P SAM proxy (enabled/disabled), externalip (public address / Tor onion / none), connect/addnode peers                                 |
| **RPC Settings**     | rpcservertimeout, rpcthreads, rpcworkqueue                                                                                                                                                       |
| **Other Settings**   | ZMQ, txindex, blocknotify, coinstatsindex, wallet settings (enable/avoidpartialspends/discardfee), pruning, dbcache, dbbatchsize, BIP158/BIP157 block filters, bloom filters, IPC (experimental) |

Settings **not** managed by StartOS (hardcoded):

| Setting         | Value                | Reason                             |
| --------------- | -------------------- | ---------------------------------- |
| `rpccookiefile` | `.cookie`            | Fixed RPC authentication           |
| `whitebind`     | `0.0.0.0:8333`       | Required for peer connections      |
| `bind`          | `0.0.0.0:58333`      | Internal peer listening port       |
| `listen`        | `1`                  | Always accepting connections       |
| `assumevalid`   | Hardcoded block hash | Performance optimization           |
| `-onion`        | `<osIp>:9050`        | StartOS Tor proxy (set at runtime) |

### Pruned Node Architecture

When pruning is enabled, the RPC architecture changes automatically:

- **Unpruned**: bitcoind binds RPC directly to `0.0.0.0:8332`
- **Pruned**: bitcoind binds RPC to `127.0.0.1:18332` and the `btc-rpc-proxy` container runs on port 8332, proxying requests to bitcoind

This is transparent to dependent services — port 8332 always serves RPC.

## Network Access and Interfaces

| Interface   | Port  | Protocol | Purpose                          | Condition                                  |
| ----------- | ----- | -------- | -------------------------------- | ------------------------------------------ |
| RPC         | 8332  | HTTP     | JSON-RPC commands                | Always                                     |
| Peer        | 8333  | TCP      | Bitcoin peer-to-peer connections | Always                                     |
| ZeroMQ      | 28332 | TCP      | Block/transaction notifications  | When ZMQ enabled                           |
| I2P Console | 7070  | HTTP     | I2P daemon web console           | When embedded I2P enabled with web console |

## Actions (StartOS UI)

### Configuration

| Action               | Purpose                                                                  | Availability |
| -------------------- | ------------------------------------------------------------------------ | ------------ |
| **Mempool Settings** | Configure mempool behavior                                               | Any          |
| **Peer Settings**    | Configure networking, I2P, public address (externalip), peer connections | Any          |
| **RPC Settings**     | Configure RPC server parameters                                          | Any          |
| **Other Settings**   | Configure ZMQ, indexes, wallets, pruning, IPC                            | Any          |

### RPC Users

| Action                            | Purpose                                        | Availability                   | Inputs       |
| --------------------------------- | ---------------------------------------------- | ------------------------------ | ------------ |
| **Generate RPC User Credentials** | Create RPC username/password for external apps | Any                            | Username     |
| **Delete RPC Users**              | Remove existing RPC user credentials           | Any (disabled when none exist) | Select users |

### Maintenance

| Action                       | Purpose                                                           | Availability |
| ---------------------------- | ----------------------------------------------------------------- | ------------ |
| **Reindex Blockchain**       | Full reindex of blocks and chainstate                             | Any          |
| **Reindex Chainstate**       | Rebuild chainstate from existing blocks (hidden for pruned nodes) | Any          |
| **Delete Peer List**         | Delete corrupted `peers.dat`                                      | Stopped only |
| **Delete Transaction Index** | Delete corrupted txindex                                          | Stopped only |
| **Delete Coinstats Index**   | Delete corrupted coinstatsindex                                   | Stopped only |

### Advanced

| Action                                  | Purpose                                                                          | Availability |
| --------------------------------------- | -------------------------------------------------------------------------------- | ------------ |
| **Download UTXO Snapshot (assumeutxo)** | Load a UTXO snapshot for fast sync (hidden when fully synced)                    | Running only |
| **Runtime Information**                 | Display connections, block height, sync progress, softfork info, IPC socket path | Running only |

## Backups and Restore

**Backed up:** The `main` and `i2pd` volumes, **excluding** `blocks/`, `chainstate/`, `indexes/` (blockchain data) and I2P ephemeral data.

**What is backed up:** `bitcoin.conf`, `store.json`, wallet files, `peers.dat`.

**What is NOT backed up:** Blockchain data must be re-synced after restore.

**Restore warning:** Restoring overwrites current data. Watch-only wallet transactions and hot wallet funds received since the last backup will be lost.

## Health Checks

| Check             | Method                                                  | Messages                                                             |
| ----------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| **RPC**           | Waits for `.cookie` file, then `bitcoin-cli getrpcinfo` | Ready: "The Bitcoin RPC Interface is ready"                          |
| **Sync Progress** | `bitcoin-cli getblockchaininfo`                         | Shows percentage during IBD; "Bitcoin is fully synced" when complete |

## Dependencies

| Dependency | Condition                                                                                | Required State              |
| ---------- | ---------------------------------------------------------------------------------------- | --------------------------- |
| **Tor**    | When `wantsOnion` is true, `externalip` contains `.onion`, or `onlynet` includes `onion` | Running (>= 0.4.8:0-beta.0) |

When a Tor onion address is requested via the **Peer Settings** action, a task is created asking Tor to provision an onion service. Once fulfilled, the onion address is set as `externalip` automatically. Other StartOS services (LND, Core Lightning, Electrs, etc.) depend on Bitcoin Core.

## Limitations and Differences

1. **Custom Docker image** — built from source with IPC and ZMQ support; adds runtime utilities not in upstream releases
2. **Tor proxy always configured** — the `-onion` flag is set to the StartOS Tor proxy on every start; Tor itself is a conditional dependency (required only when onion connectivity is configured)
3. **RPC cookie auth enforced** — `rpcuser`/`rpcpassword` are forcibly removed; authentication uses `.cookie` or `rpcauth` credentials generated via the action
4. **Disk-aware defaults** — pruning and txindex are auto-configured based on available disk space (< 900 GB enables pruning)
5. **Pruned nodes use RPC proxy** — an intermediary `btc-rpc-proxy` container transparently fetches pruned blocks over the P2P network, allowing dependent services to request any block even from a pruned node
6. **IPC is experimental** — enabling IPC switches the binary from `bitcoind` to `bitcoin-node` (multiprocess) and requires a restart
7. **5-minute shutdown timeout** — SIGTERM allows 300 seconds for graceful database flush
8. **Embedded I2P enabled by default** — a bundled `i2pd` daemon provides the I2P SAM proxy, with `i2pacceptincoming=true`; inbound I2P connections work out of the box with no user configuration. Can be disabled via Peer Settings

## What Is Unchanged from Upstream

- Block validation and consensus rules
- Peer-to-peer networking (gossip, block relay, transaction relay)
- Wallet functionality (key management, signing, coin selection)
- JSON-RPC API (all commands)
- ZeroMQ notification interface
- Transaction and block index behavior
- Mempool policy
- Mining/block template support
- BIP compliance (BIP324, BIP158, BIP157, etc.)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: bitcoind
upstream_version: 30.2
image: custom Dockerfile (built from Bitcoin Core v30.2 source)
additional_images:
  - ghcr.io/start9labs/btc-rpc-proxy (pruned node RPC proxy)
  - python:3.13.11-alpine (RPC credential generation)
  - purplei2p/i2pd:release-2.58.0 (embedded I2P)
architectures: [x86_64, aarch64, riscv64]
volumes:
  main: /root/.bitcoin
  i2pd: /home/i2pd
ports:
  rpc: 8332
  peer: 8333
  zmq: 28332 (conditional)
  i2p-console: 7070 (conditional)
dependencies:
  tor: conditional (onion connectivity)
startos_managed_files:
  - store.json
actions:
  - mempool-config
  - peers-config
  - rpc-config
  - other-config
  - generate-rpcuser
  - delete-rpcauth
  - reindex-blockchain
  - reindex-chainstate
  - delete-peers
  - delete-txindex
  - delete-coinstats-index
  - assumeutxo
  - runtime-info
health_checks:
  - bitcoin-cli_getrpcinfo: rpc_ready
  - bitcoin-cli_getblockchaininfo: sync_progress
backup_volumes:
  - main (excluding blocks/, chainstate/, indexes/)
  - i2pd (excluding ephemeral data)
```
