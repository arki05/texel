// Prose with inline math, drawn from its layout (layout/paragraph.ts): each
// wrapped row as tall as its tallest formula, the text on the row's text row.

import type { RenderElement } from 'claude-code'

import { formulaSource, layoutParagraph, type Formula, type LaidLine } from '../layout/paragraph'
import type { Line } from '../layout/wrap'
import type { InlineLine } from '../markdown/parse'
import { image, type ViewContext } from './parts'

// One wrapped row. Text sits on the row's text row, `row.above` rows down; a
// formula's own rows above its text row line up with it.
function drawWrapped(ctx: ViewContext, row: Line<Formula>, lead: RenderElement[]): RenderElement[] {
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
        <Box marginTop={row.above - piece.above}>
          {image(ctx.ui, piece.box.picture, piece.columns, piece.box.rows, formulaSource(piece.box.tex))}
        </Box>
      ),
    ),
  ]
}

// A paragraph line: a heading, a list item or quote with its marker, or plain
// prose; a list item's later rows hang under its text.
function drawLine(ctx: ViewContext, line: LaidLine): RenderElement {
  const { Box, Text } = ctx.ui
  return (
    <Box flexDirection="column" paddingLeft={line.indent}>
      {line.rows.map((row, i) => {
        const marker =
          i === 0 && line.prefix
            ? [
                <Box marginTop={row.above}>
                  <Text dimColor={line.prefix === '│ '}>{line.prefix}</Text>
                </Box>,
              ]
            : []
        return (
          <Box flexDirection="row" alignItems="flex-start" paddingLeft={i === 0 ? 0 : line.hang}>
            {drawWrapped(ctx, row, marker)}
          </Box>
        )
      })}
    </Box>
  )
}

/** A paragraph with inline math. */
export async function drawParagraph(ctx: ViewContext, lines: InlineLine[]): Promise<RenderElement> {
  const laid = await layoutParagraph(ctx.math, lines, { grid: ctx.grid, fit: ctx.fit, columns: ctx.columns })
  return <ctx.ui.Box flexDirection="column">{laid.map(line => drawLine(ctx, line))}</ctx.ui.Box>
}
