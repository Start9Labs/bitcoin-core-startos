import { compat, matches, types as T } from "../dependencies.ts";

export const migration: T.ExpectedExports.migration =
  compat.migrations.fromMapping(
    {
      "22.0.0": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            config.advanced.peers.addnode = (
              config.advanced.peers.addnode as string[]
            )
              .map((node) => {
                if (typeof node === "string") {
                  const [hostname, port] = node.split(":");
                  return { hostname, port: port || null };
                }
              })
              .filter((a) => !!a);

            config.advanced.blockfilters = {
              blockfilterindex: false,
              peerblockfilters: false,
            };

            return config;
          },
          false,
          { version: "22.0.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            config.advanced.peers.addnode = (
              config.advanced.peers.addnode as {
                hostname: string;
                port: number;
              }[]
            )
              .map((node) => {
                if (typeof node === "object" && node && "hostname" in node) {
                  return node.hostname;
                }
              })
              .filter((a) => !!a);

            delete config.advanced.blockfilters;

            return config;
          },
          false,
          {
            version: "22.0.0",
            type: "down",
          }
        ),
      },
      "22.0.1": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            config.advanced.peers.addnode = (
              config.advanced.peers.addnode as unknown[]
            )
              .map((node: any) => {
                if (typeof node === "string") {
                  return { hostname: node, port: null };
                } else if (
                  typeof node === "object" &&
                  node &&
                  "hostname" in node
                ) {
                  return {
                    hostname: node.hostname,
                    port: "port" in node ? node.port : null,
                  };
                }
              })
              .filter((a) => !!a);

            return config;
          },
          false,
          { version: "22.0.1", type: "up" }
        ),
        down: compat.migrations.updateConfig((config) => config, true, {
          version: "22.0.1",
          type: "down",
        }),
      },
      "23.0.0": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            config.advanced.bloomfilters = { peerbloomfilters: false };

            return config;
          },
          false,
          { version: "23.0.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            delete config.advanced.bloomfilters;

            return config;
          },
          false,
          { version: "23.0.0", type: "down" }
        ),
      },
      "24.0.0": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            config.advanced.mempool.mempoolfullrbf = false;

            return config;
          },
          false,
          { version: "24.0.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            delete config.advanced.mempool.mempoolfullrbf;

            return config;
          },
          false,
          { version: "24.0.0", type: "down" }
        ),
      },
      "25.0.0": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            delete config["zmq-enabled"];

            delete config.rpc.advanced.serialversion;
            config.rpc = {
              ...config.rpc,
              ...config.rpc.advanced,
            };
            delete config.rpc.advanced;

            config.mempool = config.advanced.mempool;
            delete config.advanced.mempool;

            config.peers = config.advanced.peers;
            delete config.advanced.peers;

            if (config.advanced.pruning.mode === "manual") {
              config.advanced.pruning = { mode: "automatic", size: 550 };
            }

            return config;
          },
          true,
          { version: "25.0.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            config["zmq-enabled"] = true;

            config.rpc.advanced.serialversion = "segwit";
            config.rpc.advanced = {
              auth: config.rpc.auth,
              servertimeout: config.rpc.servertimeout,
              threads: config.rpc.threads,
              workqueue: config.rpc.workqueue,
            };
            delete config.rpc.auth;
            delete config.rpc.servertimeout;
            delete config.rpc.threads;
            delete config.rpc.workqueue;

            config.advanced.mempool = config.mempool;
            delete config.mempool;

            config.advanced.peers = config.peers;
            delete config.peers;

            return config;
          },
          true,
          { version: "25.0.0", type: "down" }
        ),
      },
      "25.0.0.2": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            config["zmq-enabled"] = true;

            config.rpc.advanced = {
              auth: config.rpc.auth,
              servertimeout: config.rpc.servertimeout,
              threads: config.rpc.threads,
              workqueue: config.rpc.workqueue,
            };
            delete config.rpc.auth;
            delete config.rpc.servertimeout;
            delete config.rpc.threads;
            delete config.rpc.workqueue;

            config.advanced.mempool = config.mempool;
            delete config.mempool;

            config.advanced.peers = config.peers;
            delete config.peers;

            return config;
          },
          true,
          { version: "25.0.0.2", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            delete config["zmq-enabled"];

            config.rpc = {
              ...config.rpc,
              ...config.rpc.advanced,
            };
            delete config.rpc.advanced;

            config.mempool = config.advanced.mempool;
            delete config.advanced.mempool;

            config.peers = config.advanced.peers;
            delete config.advanced.peers;

            return config;
          },
          true,
          { version: "25.0.0.2", type: "down" }
        ),
      },
      "26.0.0": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            config.advanced.peers.v2transport = false;

            return config;
          },
          true,
          { version: "26.0.0", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            delete config.advanced.peers.v2transport;

            return config;
          },
          true,
          { version: "26.0.0", type: "down" }
        ),
      },
      "26.0.0.1": {
        up: compat.migrations.updateConfig((config: any) => config, false, {
          version: "26.0.0.1",
          type: "up",
        }),
        down: compat.migrations.updateConfig(
          (config: any) => {
            delete config.coinstatsindex;
            delete config.advanced.mempool.permitbaremultisig;
            delete config.advanced.mempool.datacarrier;
            delete config.advanced.mempool.datacarriersize;

            return config;
          },
          true,
          { version: "26.0.0.1", type: "down" }
        ),
      },
      "28.0.0.1": {
        up: compat.migrations.updateConfig(
          (config) => {
            if (
              matches
                .shape({
                  advanced: matches.shape({
                    blocknotify: matches.any,
                  }),
                })
                .test(config)
            ) {
              throw new Error("Upgrading from Knots to Core is prohibited.");
            }
            return config;
          },
          true,
          {
            version: "28.0.0.1",
            type: "up",
          }
        ),
        down: compat.migrations.updateConfig((config: any) => config, true, {
          version: "28.0.0.1",
          type: "down",
        }),
      },
      "28.1.0": {
        up: compat.migrations.updateConfig(
          (config) => {
            if (
              matches
                .shape({
                  advanced: matches.shape({
                    blocknotify: matches.any,
                  }),
                })
                .test(config)
            ) {
              throw new Error("Upgrading from Knots to Core is prohibited.");
            }
            return config;
          },
          true,
          {
            version: "28.1.0",
            type: "up",
          }
        ),
        down: compat.migrations.updateConfig((config: any) => config, true, {
          version: "28.1.0",
          type: "down",
        }),
      },
      "28.1.0.2": {
        up: compat.migrations.updateConfig(
          (config) => {
            if (
              matches
                .shape({
                  advanced: matches.shape({
                    blocknotify: matches.any,
                  }),
                })
                .test(config)
            ) {
              throw new Error("Upgrading from Knots to Core is prohibited.");
            }
            return config;
          },
          true,
          {
            version: "28.1.0.2",
            type: "up",
          }
        ),
        down: compat.migrations.updateConfig((config: any) => config, true, {
          version: "28.1.0.2",
          type: "down",
        }),
      },
      "29.1.0": {
        up: compat.migrations.updateConfig(
          (config) => {
            if (
              matches
                .shape({
                  advanced: matches.shape({
                    blocknotify: matches.any,
                  }),
                })
                .test(config)
            ) {
              throw new Error(
                "Due to a bug in StartOS, and to protect against people accidentally switching from Core to Knots, or from Knots to Core, it is not possible to UPDATE from one to the other. To switch between them, the current version and the target version must be the same."
              );
            }
            return config;
          },
          true,
          {
            version: "29.1.0",
            type: "up",
          }
        ),
        down: compat.migrations.updateConfig((config: any) => config, true, {
          version: "29.1.0",
          type: "down",
        }),
      },
      "29.1.0.1": {
        up: compat.migrations.updateConfig(
          (config) => {
            if (
              matches
                .shape({
                  advanced: matches.shape({
                    blocknotify: matches.any,
                  }),
                })
                .test(config)
            ) {
              throw new Error(
                "Due to a bug in StartOS, and to protect against people accidentally switching from Core to Knots, or from Knots to Core, it is not possible to UPDATE from one to the other. To switch between them, the current version and the target version must be the same."
              );
            }
            return config;
          },
          true,
          {
            version: "29.1.0.1",
            type: "up",
          }
        ),
        down: compat.migrations.updateConfig((config: any) => config, true, {
          version: "29.1.0.1",
          type: "down",
        }),
      },
      "29.2.0": {
        up: compat.migrations.updateConfig(
          (config) => {
            if (
              matches
                .shape({
                  advanced: matches.shape({
                    blocknotify: matches.any,
                  }),
                })
                .test(config)
            ) {
              throw new Error(
                "Due to a bug in StartOS, and to protect against people accidentally switching from Core to Knots, or from Knots to Core, it is not possible to UPDATE from one to the other. To switch between them, the current version and the target version must be the same."
              );
            }
            return config;
          },
          true,
          {
            version: "29.2.0",
            type: "up",
          }
        ),
        down: compat.migrations.updateConfig((config: any) => config, true, {
          version: "29.2.0",
          type: "down",
        }),
      },
    },
    "30.1.0"
  );
