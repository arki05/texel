// Bytes as base64: what an Image's `rgba` source carries.

type WithBase64 = Uint8Array & { toBase64?: () => string }

export function toBase64(bytes: Uint8Array): string {
  const native = (bytes as WithBase64).toBase64
  if (native) return native.call(bytes)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}
