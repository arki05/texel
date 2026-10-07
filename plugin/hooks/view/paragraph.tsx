// Prose with inline math, laid out by texel rather than the engine: each
// formula is measured and fitted into its line, the line wrapped at the
// transcript's width, and every row of it grown to hold its tallest formula.

import type { RenderElement } from 'claude-code'

import { fitInline } from '../layout/fit'
import { cells, wrap, type Line, type Piece } from '../layout/wrap'
import type { InlineLine } from '../markdown/parse'
import { isFailure, type RenderFailure } from '../render/renderer'
import { image, reason, type ViewContext } from './parts'

/** A rendered inline formula: what a line's box piece carries. */
type Formula = { file: string; rows: number; tex: string }

const source = (tex: string) => `\\(${tex}\\)`

// A failed formula: its source, then why, dim.
function failed(tex: string, failure: RenderFailure): Piece<Formula>[] {
  return [
    { kind: 'text', text: source(tex) },
    { kind: 'text', text: ` (${reason(failure, 60)})`, dim: true },
  ]
}

// Measured, fitted into a line `maxColumns` wide, and drawn as fitted.
async function formula(ctx: ViewContext, tex: string, maxColumns: number): Promise<Piece<Formula>[]> {
  const ink = await ctx.renderer.measure(tex)
  if (isFailure(ink)) return failed(tex, ink)
  const { above, below, placement } = fitInline(ink, ctx.grid, maxColumns, ctx.fit)
  const drawn = await ctx.renderer.render({ kind: 'inline', tex, placement }, maxColumns)
  if (isFailure(drawn)) return failed(tex, drawn)
  return [{ kind: 'box', columns: drawn.columns, above, below, box: { file: drawn.file, rows: drawn.rows, tex } }]
}

// One wrapped row. Text sits on the row's text row, `row.above` rows down; a
// formula's own rows above the text line up with it.
function drawRow(ctx: ViewContext, row: Line<Formula>, lead: RenderElement[]): RenderElement[] {
  const { Box, Text } = ctx.ui
  return [
    ...lead,
    ...row.pieces.map(piece =>
      piece.kind === 'text' ? (
        <Box marginTop={row.above}>
          <Text bold={piece.bold} italic={piece.italic} dimColor={piece.dim} color={piece.code ? 'permission' : undefined}>
            {piece.text}
          </Text>
        </Box>
      ) : (
        <Box marginTop={row.above - piece.above}>{image(ctx.ui, piece.box.file, piece.columns, piece.box.rows, source(piece.box.tex))}</Box>
      ),
    ),
  ]
}

// A paragraph line: a heading, a list item or quote with its marker, or plain
// prose; a list item's continuation rows hang under its text, not its marker.
async function drawLine(ctx: ViewContext, line: InlineLine) {
  const { Box, Text } = ctx.ui
  const hang = cells(line.prefix)
  const width = Math.max(8, ctx.columns - line.indent - hang)
  const pieces = (
    await Promise.all(line.atoms.map(atom => (atom.kind === 'math' ? formula(ctx, atom.tex, width) : [atom])))
  ).flat()

  return (
    <Box flexDirection="column" paddingLeft={line.indent}>
      {wrap(pieces, width).map((row, i) => {
        const marker =
          i === 0 && line.prefix
            ? [
                <Box marginTop={row.above}>
                  <Text dimColor={line.prefix === '│ '}>{line.prefix}</Text>
                </Box>,
              ]
            : []
        return (
          <Box flexDirection="row" alignItems="flex-start" paddingLeft={i === 0 ? 0 : hang}>
            {drawRow(ctx, row, marker)}
          </Box>
        )
      })}
    </Box>
  )
}

export async function drawParagraph(ctx: ViewContext, lines: InlineLine[]) {
  const { Box } = ctx.ui
  return <Box flexDirection="column">{await Promise.all(lines.map(line => drawLine(ctx, line)))}</Box>
}
