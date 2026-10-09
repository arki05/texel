// PNG, as far as texel needs it: written from RGBA pixels (what an Image is
// sent as, compressed), read back for tests, and sized from its header.

import { unzlib, zlib } from './vendor/fflate-entry.js'

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(bytes: Uint8Array) {
  let c = ~0
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff]! ^ (c >>> 8)
  return ~c >>> 0
}

// A chunk: its length, type, data, and the CRC of type and data.
function chunk(type: string, data: Uint8Array) {
  const out = new Uint8Array(12 + data.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length)
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i)
  out.set(data, 8)
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

/** `width` x `height` RGBA pixels as a PNG file. */
export function encodePng(rgba: Uint8Array, width: number, height: number): Uint8Array {
  const header = new Uint8Array(13)
  const view = new DataView(header.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  header.set([8, 6, 0, 0, 0], 8) // 8 bits, RGBA, deflate, no filter method, no interlace
  // Each row led by its filter type, 0: none.
  const rows = new Uint8Array((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) rows.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1)
  const parts = [new Uint8Array(SIGNATURE), chunk('IHDR', header), chunk('IDAT', zlib(rows)), chunk('IEND', new Uint8Array())]
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0))
  parts.reduce((at, p) => (out.set(p, at), at + p.length), 0)
  return out
}

/** The RGBA pixels of a PNG `encodePng` wrote. */
export function decodePng(png: Uint8Array): { rgba: Uint8Array; width: number; height: number } {
  const view = new DataView(png.buffer, png.byteOffset)
  const [width, height] = [view.getUint32(16), view.getUint32(20)]
  const idat = png.subarray(41, 41 + view.getUint32(33))
  const rows = unzlib(idat)
  const rgba = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y++) rgba.set(rows.subarray(y * (width * 4 + 1) + 1, (y + 1) * (width * 4 + 1)), y * width * 4)
  return { rgba, width, height }
}

/** Width and height in pixels of the PNG whose bytes, base64, `base64` begins. */
export function pngSize(base64: string) {
  const head = atob(base64.slice(0, 44))
  const u32 = (at: number) =>
    ((head.charCodeAt(at) << 24) | (head.charCodeAt(at + 1) << 16) | (head.charCodeAt(at + 2) << 8) | head.charCodeAt(at + 3)) >>> 0
  return { width: u32(16), height: u32(20) }
}
