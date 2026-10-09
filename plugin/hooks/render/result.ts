// What a render comes to: a picture of whole cells, or why there is none.

import { MAX_CELLS } from '../layout/geometry'

/** A picture's pixels: a PNG file typst wrote, or RGBA bytes held in memory (base64). */
export type Picture = { file: string } | { rgba: string; width: number; height: number }

/** A picture, and the cells it covers. */
export type Rendered = { picture: Picture; columns: number; rows: number }

/**
 * Why there is no picture: a render that failed (`transient` when trying
 * again could succeed), or one `skipped` by the person's settings.
 */
export type RenderFailure = { error: string; transient?: true; skipped?: true }

/** Why a picture of `columns` x `rows` cells cannot be shown, if it cannot. */
export function tooLarge(columns: number, rows: number): RenderFailure | undefined {
  if (columns <= MAX_CELLS && rows <= MAX_CELLS) return undefined
  return { error: `too large to show: ${columns} x ${rows} cells (an image holds ${MAX_CELLS} x ${MAX_CELLS})` }
}

export function isFailure(result: object): result is RenderFailure {
  return 'error' in result
}

/** What a block shows under its source: whether it was skipped or failed, and why. */
export function verdict(failure: RenderFailure) {
  return `${failure.skipped ? 'not rendered' : 'render failed'}: ${reason(failure)}`
}

/** A failure's first line, without typst's `error:`, cut to `max` characters. */
export function reason(failure: RenderFailure, max = 200) {
  const line = failure.error.split('\n')[0]!.replace(/^error:\s*/, '')
  return line.length > max ? `${line.slice(0, max - 1)}…` : line
}
