export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'I2P Proxy': 0,
  'I2P Proxy is ready': 1,
  'I2P Proxy is not ready': 2,
  'RPC': 3,
  'The Bitcoin RPC Interface is ready': 4,
  'The Bitcoin RPC Interface is not ready': 5,
  'Blockchain Sync Progress': 6,
  'Bitcoin is fully synced': 7,
  'Bitcoin is starting\u2026': 8,
  'RPC Proxy': 9,
  'The Bitcoin RPC Proxy is ready': 10,
  'The Bitcoin RPC Proxy is not ready': 11,

  // interfaces.ts
  'RPC Interface': 12,
  'Listens for JSON-RPC commands': 13,
  'Peer Interface': 14,
  'Listens for incoming connections from peers on the bitcoin network': 15,
  'ZeroMQ Interface': 16,
  'I2P Daemon Console': 17,
  'Interface to access the embedded I2P daemon console': 18,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
