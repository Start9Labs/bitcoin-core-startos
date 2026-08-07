# Bitcoin Core

Bitcoin Core begins its Initial Block Download (IBD) — fetching and verifying the entire chain — the moment it launches; nothing needs configuring first. This page covers what's specific to running it on StartOS.

## Documentation

- [Start9 Bitcoin Guides](https://docs.start9.com/bitcoin-guides/) — running and syncing Bitcoin Core on StartOS, pruning, and connecting wallets and other services to it.

## What you get on StartOS

- **A full Bitcoin node** — downloads, verifies, and relays the entire blockchain, then stays in sync.
- **A JSON-RPC interface on port 8332** that other StartOS services (Lightning nodes, Electrum servers, mempool explorers) and external apps connect to.
- **ZeroMQ block and transaction notifications** for services that subscribe to them.
- **Privacy networking out of the box** — outbound peer connections go over Tor, and a bundled I2P daemon accepts inbound I2P connections, with no setup required.
- **Disk-aware sizing** — on disks under roughly 900 GB the node prunes automatically (and leaves `txindex` off) to fit; on larger disks it runs as a full archival node. Either way it still behaves like a full node to anything using its RPC — see **Pruned nodes** below. Initial sync also runs with a temporarily larger database cache that reverts to the upstream default once it completes.
- **Configuration through StartOS actions** instead of hand-editing `bitcoin.conf`.
- **Shared `bitcoind` package id with Bitcoin Knots** — you can switch flavors without re-syncing the chain. During a BIP-110 (RDTS) chain split, switching additionally adjusts the node's recorded block verdicts automatically so it follows the chain the new flavor considers valid (see [Switching flavors during a chain split](#switching-flavors-during-a-chain-split)).

## Getting set up

There is no setup wizard and nothing required to start using Bitcoin Core — it begins syncing on first launch.

1. Open Bitcoin Core's **Dashboard** tab to watch sync progress. A full Initial Block Download takes anywhere from several hours to a few days depending on your hardware, disk, and network.
2. To use a service that depends on Bitcoin Core — a Lightning node, an Electrum server, a block explorer — just install it; it configures its connection to Bitcoin Core automatically. It will report that it's waiting for Bitcoin to sync until IBD finishes.
3. To connect an external wallet or app, follow instructions in the Start9 Bitcoin guides (linked above).

## Using Bitcoin Core

Bitcoin Core surfaces its interfaces — RPC, peer, ZeroMQ, and the I2P console when you've enabled it — on the **Dashboard** tab; everything else is driven by actions in the service's sidebar.

### RPC access

The JSON-RPC API listens on port 8332. Dependent StartOS services connect and configure themselves automatically when you install them — you set nothing up. For an external wallet or app, run **Generate RPC User Credentials** to mint a username and password, then point the app at port 8332. **Delete RPC Users** removes credentials you've created. `rpcuser`/`rpcpassword` lines in `bitcoin.conf` are not supported and are stripped; authentication is the `.cookie` file or `rpcauth` users.

### Pruned nodes

On a small disk Bitcoin Core runs **pruned** — it keeps validating every block but discards old block files once they're checked, so on-disk usage stays around a few hundred MB of recent blocks instead of the full multi-hundred-GB chain. Pruning is on by default below roughly 900 GB of disk; you can also toggle it under **Other Settings**.

So that a pruned node is still useful to wallets and services that occasionally need an old block, a bundled proxy — `btc-rpc-proxy` — runs in front of it on port 8332. When something requests a block the node has pruned, the proxy fetches that block from the peer-to-peer network on the spot and serves it back over the normal RPC. To anything using the RPC — a Lightning node rescanning, an Electrum server, a block explorer — the node looks like a full archival node and works with no special configuration. The only cost is a little latency whenever an old block is needed, since it comes over the network rather than off your disk.

### Configuration

Four actions write to `bitcoin.conf` for you. Only values that differ from upstream defaults are stored, and each field shows its upstream default.

- **Mempool Settings** — mempool size and expiry, persistence, bare-multisig and `OP_RETURN` relay policy, blocks-only mode.
- **Peer Settings** — which networks to use (`onlynet`: IPv4/IPv6/Tor/I2P/CJDNS), BIP324 v2 transport, the embedded I2P SAM proxy, and manual `addnode`/`connect` peers.
- **RPC Settings** — RPC server timeout, thread count, and work-queue depth.
- **Other Settings** — ZeroMQ, `txindex`, coinstats index, BIP158/BIP157 block filters, bloom filters, wallet options, pruning, and database cache tuning.

Some options are fixed by the package and not exposed: RPC cookie authentication, the peer listen ports, `assumevalid`, and the Tor proxy. Advanced i2pd-daemon tuning isn't in the UI either — edit `i2pd.conf` on the `i2pd` volume if you need it.

### Maintenance

- **Reindex Blockchain** — rebuild blocks and chainstate from scratch (use after on-disk corruption).
- **Reindex Chainstate** — rebuild just the chainstate from existing blocks (hidden on pruned nodes).
- **Delete Peer List** / **Delete Transaction Index** / **Delete Coinstats Index** — remove a corrupted `peers.dat`, `txindex`, or `coinstatsindex`. The service must be stopped to run these.

### Switching flavors during a chain split

Bitcoin Core and the Bitcoin Knots flavors share the `bitcoind` package id and data volume, so switching flavors keeps the synced chain. However, bitcoind permanently records its verdict on every block it has seen, and those verdicts do not record _which_ rules produced them — a freshly switched binary trusts them as-is and never re-checks buried blocks on its own. If the network splits over BIP-110 (RDTS), that inheritance would silently pin your node to the previous flavor's chain. Bitcoin Core never enforces RDTS, so only one direction needs correcting here, and it happens automatically at the first start after a switch:

- **Arriving at this flavor** (from the RDTS-enforcing Bitcoin Knots flavor): blocks that flavor rejected under RDTS remain marked invalid, which would stop Bitcoin Core from following the majority chain. This package clears those verdicts (`reconsiderblock` on every invalid chain tip) and follows the best chain valid under _its_ rules. You get a "Chain Verdicts Reset" notification when anything was cleared.
- **Leaving this flavor** (to the RDTS-enforcing Bitcoin Knots flavor) with a chain already synced past the RDTS-applicable range: those blocks were never checked against RDTS here, and that flavor re-validates the affected range itself on its first start — there is nothing to do on this side before switching.

Caveats that apply during an actual split:

- **Pruned nodes.** Reorganizing onto a different chain requires block data your node may have pruned away. If the needed range is gone, the package skips the in-place remedy (with a notification) and directs you to **Reindex Blockchain**, which on a pruned node re-downloads the entire chain. A pruned node also cannot reorganize deeper than its retained window (at least the most recent 288 blocks), so during a split significantly older than ~2 days a pruned node that switched sides may need that full re-download.
- **Peers matter.** Clearing verdicts lets your node _accept_ the intended chain; actually following it requires peers that serve that chain's blocks. During a contentious split, add a trusted node on your preferred side via **Peer Settings → Add Nodes** if your node does not converge.
- **Dependent services.** Correcting inherited verdicts can reorganize this node onto a different chain, and during a split that reorg can be deep. Services that depend on this node — especially Lightning (LND, Core Lightning) — are not safe against arbitrarily deep reorgs: a reorg past a channel's funding depth can force-close channels. After switching flavors during a split, verify your dependent services' state.

### Other actions

- **Download UTXO Snapshot (assumeutxo)** — fast-sync from a recent UTXO snapshot; available while running, hidden once fully synced. The URL must be a direct link to a `.dat` snapshot file, which can be one you serve from your own machine over the LAN.
- **Runtime Information** — connection count, block height, sync progress, and soft-fork status.

## Limitations

- **Blockchain data is not backed up.** Backups cover `bitcoin.conf`, `store.json`, wallets, and `peers.dat` — block and chainstate data re-sync after a restore.
- **Shutdown can take up to 5 minutes** while the database flushes; let it finish rather than force-stopping.
- **No IPC on this version** — Bitcoin Core's experimental multiprocess IPC socket isn't available here; run the 31.x package if you need it.
- **Some i2pd tuning isn't in the UI** (log level, bandwidth class, transit limits, web console) — edit `i2pd.conf` directly if you need to change those.
