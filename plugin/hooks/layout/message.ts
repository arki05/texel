// Lays out a whole message, as data: plain markdown as it is, prose with
// inline math as lines, each block as a picture, and what cannot be a
// picture as its source, with a note saying why. Every such decision is
// made here; the view only draws the result.

import { MESSAGE_PICTURE_BYTES } from '../geometry'
import type { Segment } from '../markdown/parse'
import type { Renderers } from '../render/renderer'
import { isFailure, verdict, type Picture, type Rendered } from '../render/result'
import { layoutParagraph, type LaidLine, type ParagraphOptions } from './paragraph'

export type Laid =
  | { kind: 'markdown'; text: string }
  | { kind: 'lines'; lines: LaidLine[] }
  | { kind: 'picture'; rendered: Rendered; alt: string }
  /** Source as written: with a note saying why it is not a picture, or none while its picture is on its way. */
  | { kind: 'source'; source: string; note?: string }

/** `segments` laid out `options.columns` wide, every formula and block drawn by `renderers`. */
export async function layoutMessage(renderers: Renderers, segments: Segment[], options: ParagraphOptions): Promise<Laid[]> {
  const laid = await Promise.all(segments.map(segment => layoutSegment(renderers, segment, options)))
  return withinBudget(laid, segments)
}

async function layoutSegment(renderers: Renderers, segment: Segment, options: ParagraphOptions): Promise<Laid> {
  switch (segment.kind) {
    case 'markdown':
      return { kind: 'markdown', text: segment.text }
    case 'paragraph':
      return { kind: 'lines', lines: await layoutParagraph(renderers.inline, segment.lines, options) }
    case 'block': {
      const drawn = await renderers.blocks[segment.renderer](segment.body, options.columns)
      if (!drawn) return { kind: 'source', source: segment.source }
      if (isFailure(drawn)) return { kind: 'source', source: segment.source, note: verdict(drawn) }
      return { kind: 'picture', rendered: drawn, alt: segment.renderer === 'math' ? segment.body : 'typst block' }
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
    return { kind: 'source', source, note: 'not rendered: more pictures than one message can hold' }
  })
}
