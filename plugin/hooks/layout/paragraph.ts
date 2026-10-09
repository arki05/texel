// Lays out prose with inline math, as data: each formula measured, fitted
// into its line and drawn, each line wrapped at the transcript's width with
// every row grown to hold its tallest formula. The view only draws the result.

import type { Atom, InlineLine } from '../markdown/parse'
import type { MathBackend } from '../render/renderer'
import { isFailure, reason, type Picture, type RenderFailure } from '../render/result'
import { fitInline, MIN_READABLE, type FitOptions } from './fit'
import type { Grid, Placement } from '../geometry'
import { cells, wrap, type Line, type Piece } from './wrap'

/** A rendered inline formula: what a row's box piece carries. */
export type Formula = { picture: Picture; rows: number; tex: string }

/** A paragraph line laid out: its marker (a quote's, dim), its indent, the hang of its later rows, and the rows. */
export type LaidLine = { prefix: string; quote?: true; indent: number; hang: number; rows: Line<Formula>[] }

export type ParagraphOptions = { grid: Grid; fit: FitOptions; columns: number }

/** A formula in source form: how a failed one is shown. */
export const formulaSource = (tex: string) => `\\(${tex}\\)`

// A failed formula: its source, then why, dim.
function failed(tex: string, failure: RenderFailure): Piece<Formula>[] {
  return [
    { kind: 'text', text: formulaSource(tex) },
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
async function formula(math: MathBackend, tex: string, options: ParagraphOptions, width: number, side: Placement['side']): Promise<Piece<Formula>[]> {
  const ink = await math.ink(tex)
  if (isFailure(ink)) return failed(tex, ink)
  const { above, below, placement } = fitInline(ink, options.grid, width, options.fit)
  // A smaller least scale the person chose is theirs to keep.
  if (placement.scale < Math.min(MIN_READABLE, options.fit.minScale)) return failed(tex, { error: 'too large for the line' })
  const drawn = await math.picture({ kind: 'inline', tex, placement: side ? { ...placement, side } : placement })
  if (isFailure(drawn)) return failed(tex, drawn)
  return [{ kind: 'box', columns: drawn.columns, above, below, box: { picture: drawn.picture, rows: drawn.rows, tex } }]
}

/** `lines` laid out, every formula in them drawn by `math`. */
export function layoutParagraph(math: MathBackend, lines: InlineLine[], options: ParagraphOptions): Promise<LaidLine[]> {
  return Promise.all(
    lines.map(async line => {
      // A list item's later rows hang under its text, not its marker.
      const hang = cells(line.prefix)
      const width = Math.max(8, options.columns - line.indent - hang)
      const pieces = await Promise.all(
        line.atoms.map((atom, i) =>
          atom.kind === 'math' ? formula(math, atom.tex, options, width, sideOf(line.atoms[i - 1], line.atoms[i + 1])) : [atom],
        ),
      )
      return { prefix: line.prefix, quote: line.quote, indent: line.indent, hang, rows: wrap(pieces.flat(), width) }
    }),
  )
}
