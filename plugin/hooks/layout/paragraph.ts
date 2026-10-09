// Lays out prose with inline math, as data: each formula measured, fitted
// into its line and drawn, each line wrapped at the transcript's width with
// every row grown to hold its tallest formula. The view only draws the result.

import type { Atom, InlineLine } from '../markdown/parse'
import { MIN_READABLE, type Grid, type Placement } from '../geometry'
import type { InlineRenderer } from '../render/renderer'
import { isFailure, reason, TOO_WIDE, type Picture, type RenderFailure } from '../render/result'
import { fitInline, type FitOptions } from './fit'
import { cells, wrap, type Line, type Piece } from './wrap'

/** A rendered inline formula: what a row's box piece carries, its source the picture's alt. */
export type Formula = { picture: Picture; rows: number; source: string }

/** A paragraph line laid out: its marker (a quote's, dim), its indent, the hang of its later rows, and the rows. */
export type LaidLine = { prefix: string; quote?: true; indent: number; hang: number; rows: Line<Formula>[] }

export type ParagraphOptions = { grid: Grid; fit: FitOptions; columns: number }

// A failed formula: its source as written, then why, dim.
function failed(source: string, failure: RenderFailure): Piece<Formula>[] {
  return [
    { kind: 'text', text: source },
    { kind: 'text', text: ` (${reason(failure, 60)})`, dim: true },
  ]
}

// The side of its box a formula's ink keeps to: a box is whole cells, the
// ink rarely is, and what is left over belongs where a space already is.
// Against punctuation that follows it with no space (`\(x\),`) or an opening
// that comes before it with none (`(\(x\)`); centred between spaces.
function sideOf(before: Atom | undefined, after: Atom | undefined): Placement['side'] {
  const tight = (atom: Atom | undefined, edge: RegExp) => atom?.kind === 'text' && edge.test(atom.text)
  const left = tight(before, /\S$/)
  const right = tight(after, /^\S/)
  return left === right ? undefined : left ? 'left' : 'right'
}

// One formula measured, fitted into a line `width` cells wide and drawn as fitted.
async function formula(math: InlineRenderer, { tex, source }: { tex: string; source: string }, options: ParagraphOptions, width: number, side: Placement['side']): Promise<Piece<Formula>[]> {
  const ink = await math.ink(tex)
  if (isFailure(ink)) return failed(source, ink)
  const { above, below, placement } = fitInline(ink, options.grid, width, options.fit)
  // A smaller least scale the person chose is theirs to keep.
  if (placement.scale < Math.min(MIN_READABLE, options.fit.minScale)) return failed(source, TOO_WIDE)
  const drawn = await math.picture(tex, side ? { ...placement, side } : placement)
  if (isFailure(drawn)) return failed(source, drawn)
  return [{ kind: 'box', columns: drawn.columns, above, below, box: { picture: drawn.picture, rows: drawn.rows, source } }]
}

/** `lines` laid out, every formula in them drawn by `math`. */
export function layoutParagraph(math: InlineRenderer, lines: InlineLine[], options: ParagraphOptions): Promise<LaidLine[]> {
  return Promise.all(
    lines.map(async line => {
      // A list item's later rows hang under its text, not its marker.
      const hang = cells(line.prefix)
      const width = Math.max(8, options.columns - line.indent - hang)
      const pieces = await Promise.all(
        line.atoms.map((atom, i) =>
          atom.kind === 'math' ? formula(math, atom, options, width, sideOf(line.atoms[i - 1], line.atoms[i + 1])) : [atom],
        ),
      )
      return { prefix: line.prefix, quote: line.quote, indent: line.indent, hang, rows: wrap(pieces.flat(), width) }
    }),
  )
}
