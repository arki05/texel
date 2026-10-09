// The part of fflate texel bundles into the plugin (scripts/build-vendor.mts):
// zlib compression, as a PNG's image data is compressed, and its reverse.

import { unzlibSync, zlibSync } from 'fflate'

/** `data` compressed in zlib's format. */
export function zlib(data: Uint8Array): Uint8Array {
  return zlibSync(data, { level: 6 })
}

/** zlib-compressed `data` as it was. */
export function unzlib(data: Uint8Array): Uint8Array {
  return unzlibSync(data)
}
