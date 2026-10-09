// What layout draws through. Inline math goes to MathJax, inside the hooks
// module, which answers at once. A block goes to the renderer its kind
// names: MathJax again for display math, typst for a typst block, which runs
// as a process of its own and answers "not yet" until it has drawn it.

import type { Ink } from '../geometry'
import type { BlockKind } from '../markdown/parse'
import type { Rendered, RenderFailure } from './result'

/** Which side of its box an inline formula's ink keeps to; centred if neither. */
export type Side = 'left' | 'right'

/**
 * Where an inline formula is drawn: its box in cells, its scale, its ink's
 * offset down the box (pt), and the side of the box the ink keeps to.
 */
export type Placement = { columns: number; rows: number; scale: number; dy: number; side?: Side }

/** Inline math: measured, then drawn as placed in its line. */
export type InlineRenderer = {
  ink(tex: string): Promise<Ink | RenderFailure>
  picture(tex: string, placement: Placement): Promise<Rendered | RenderFailure>
}

/**
 * A block's body drawn at most `maxColumns` wide, or why not; undefined while
 * it is not ready, and the messages are drawn again when it is.
 */
export type BlockRenderer = (body: string, maxColumns: number) => Promise<Rendered | RenderFailure | undefined>

export type Renderers = { inline: InlineRenderer; blocks: Record<BlockKind, BlockRenderer> }

/** Typst markup, laid out at most `maxColumns` wide: a figure, or prose that wraps. */
export type TypstJob = { typst: string; maxColumns: number }

/** Typst in a process of its own: what it has already made, if anything, or what a run makes. */
export type TypstBackend = {
  ready(job: TypstJob): Promise<Rendered | RenderFailure | undefined>
  render(job: TypstJob): Promise<Rendered | RenderFailure>
}
