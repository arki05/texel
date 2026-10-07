// The size of a PNG, from its IHDR chunk: the first chunk, at bytes 16..24.

/** Width and height in pixels of the PNG whose bytes, base64, `base64` begins. */
export function pngSize(base64: string) {
  const head = atob(base64.slice(0, 44))
  const u32 = (at: number) =>
    ((head.charCodeAt(at) << 24) | (head.charCodeAt(at + 1) << 16) | (head.charCodeAt(at + 2) << 8) | head.charCodeAt(at + 3)) >>> 0
  return { width: u32(16), height: u32(20) }
}
