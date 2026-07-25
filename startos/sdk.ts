import { StartSdk } from '@start9labs/start-sdk'
import { manifest } from './manifest'

/**
 * Plumbing. DO NOT EDIT.
 *
 * The exported "sdk" const will be imported and used throughout the package codebase.
 */
export const sdk = StartSdk.of().withManifest(manifest).build(true)
