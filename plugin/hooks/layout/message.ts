// Lays out a whole message, as data: plain markdown as it is, prose with
// inline math as lines, each block as a picture, and what cannot be a
// picture as its source, with a note saying why. Every such decision is
// made here; the view only draws the result.

import { MESSAGE_PICTURE_BYTES } from '../geometry'
import type { Segment } from '../markdown/parse'
import type { Renderers } from '../render/renderer'
import { isFailure, verdict, type Picture, type Rendered } from '../render/result'
import { layoutParagraph, type LaidLine, type ParagraphOptions } from './paragraph'

/** A display block's own view (TexelBlockView), and the key it is kept under. */
export type BlockView = { key: string; zoom: number; source: boolean }

/**
 * What a block's controls work on: its view, its body (what a copy takes),
 * and whether it zooms (typst blocks do; display math does not yet).
 */
export type BlockHandle = BlockView & { body: string; zoomable: boolean }

export type Laid =
  | { kind: 'markdown'; text: string }
  | { kind: 'lines'; lines: LaidLine[] }
  | { kind: 'picture'; rendered: Rendered; alt: string; block?: BlockHandle }
  /** Source as written: with a note saying why it is not a picture, or none while its picture is on its way. */
  | { kind: 'source'; source: string; note?: string; block?: BlockHandle }

/**
 * `segments` laid out `options.columns` wide, every formula and block drawn by
 * `renderers`; a block with a view in `views` (by its segment's index) drawn as
 * that view says, and handed to its controls.
 */
export async function layoutMessage(renderers: Renderers, segments: Segment[], options: ParagraphOptions, views: ReadonlyMap<number, BlockView> = new Map()): Promise<Laid[]> {
  const laid = await Promise.all(segments.map((segment, i) => layoutSegment(renderers, segment, options, views.get(i))))
  return withinBudget(laid, segments)
}

async function layoutSegment(renderers: Renderers, segment: Segment, options: ParagraphOptions, view?: BlockView): Promise<Laid> {
  switch (segment.kind) {
    case 'markdown':
      return { kind: 'markdown', text: segment.text }
    case 'paragraph':
      return { kind: 'lines', lines: await layoutParagraph(renderers.inline, segment.lines, options) }
    case 'block': {
      const block = view && { ...view, body: segment.body, zoomable: segment.renderer === 'typst' }
      if (view?.source) return { kind: 'source', source: segment.source, block }
      const drawn = await renderers.blocks[segment.renderer](segment.body, options.columns, view?.zoom ?? 1)
      if (!drawn) return { kind: 'source', source: segment.source, block }
      if (isFailure(drawn)) return { kind: 'source', source: segment.source, note: verdict(drawn), block }
      return { kind: 'picture', rendered: drawn, alt: segment.renderer === 'math' ? segment.body : 'typst block', block }
    }
  }
}

// The bytes a picture costs against MESSAGE_PICTURE_BYTES: a PNG held in
// memory; a file the terminal reads itself costs nothing.
const bytesOf = (picture: Picture) => ('png' in picture ? picture.png.length : 0)

function costOf(part: Laid) {
  if (part.kind === 'picture') return bytesOf(part.rendered.picture)
  if (part.kind !== 'lines') return 0
  const pictures = part.lines.flatMap(line => line.rows.flatMap(row => row.pieces.flatMap(piece => (piece.kind === 'box' ? [piece.box.picture] : []))))
  return pictures.reduce((sum, picture) => sum + bytesOf(picture), 0)
}

// The message as Claude Code will take it: in reading order, a segment whose
// pictures would pass MESSAGE_PICTURE_BYTES shows its source instead, as
// past it the whole drawing would be refused.
function withinBudget(laid: Laid[], segments: Segment[]): Laid[] {
  let left = MESSAGE_PICTURE_BYTES
  return laid.map((part, i) => {
    const cost = costOf(part)
    if (cost <= left) {
      left -= cost
      return part
    }
    const segment = segments[i]!
    const source = segment.kind === 'markdown' ? segment.text : segment.source
    const block = part.kind === 'picture' || part.kind === 'source' ? part.block : undefined
    return { kind: 'source', source, note: 'not rendered: more pictures than one message can hold', block }
  })
}
