// Lays out prose with inline math, as data: each formula measured, fitted
// into its line and drawn, each line wrapped at the transcript's width with
// every row grown to hold its tallest formula. The view only draws the result.

import type { InlineLine } from '../markdown/parse'
import type { Answers } from '../render/renderer'
import { isFailure, reason, type RenderFailure } from '../render/result'
import { fitInline, type FitOptions } from './fit'
import type { Grid } from './geometry'
import { cells, wrap, type Line, type Piece } from './wrap'

/** A rendered inline formula: what a row's box piece carries. */
export type Formula = { file: string; rows: number; tex: string }

/** A paragraph line laid out: its marker, its indent, the hang of its later rows, and the rows. */
export type LaidLine = { prefix: string; indent: number; hang: number; rows: Line<Formula>[] }

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

// One formula measured, fitted into a line `width` cells wide and drawn as
// fitted; undefined when `answers` has no answer yet.
async function formula(answers: Answers<undefined>, tex: string, options: ParagraphOptions, width: number) {
  const ink = await answers.ink(tex)
  if (!ink) return undefined
  if (isFailure(ink)) return failed(tex, ink)
  const { above, below, placement } = fitInline(ink, options.grid, width, options.fit)
  const drawn = await answers.picture({ kind: 'inline', tex, placement })
  if (!drawn) return undefined
  if (isFailure(drawn)) return failed(tex, drawn)
  const piece: Piece<Formula> = { kind: 'box', columns: drawn.columns, above, below, box: { file: drawn.file, rows: drawn.rows, tex } }
  return [piece]
}

/**
 * `lines` laid out with what `answers` gives: from what is already known, a
 * layout only when every formula is ready (undefined otherwise); from fresh
 * answers, always.
 */
export async function layoutParagraph(
  answers: Answers<undefined>,
  lines: InlineLine[],
  options: ParagraphOptions,
): Promise<LaidLine[] | undefined> {
  const laid = await Promise.all(
    lines.map(async line => {
      // A list item's later rows hang under its text, not its marker.
      const hang = cells(line.prefix)
      const width = Math.max(8, options.columns - line.indent - hang)
      const pieces = await Promise.all(
        line.atoms.map(atom => (atom.kind === 'math' ? formula(answers, atom.tex, options, width) : [atom])),
      )
      if (pieces.some(piece => piece === undefined)) return undefined
      return { prefix: line.prefix, indent: line.indent, hang, rows: wrap((pieces as Piece<Formula>[][]).flat(), width) }
    }),
  )
  return laid.some(line => line === undefined) ? undefined : (laid as LaidLine[])
}
