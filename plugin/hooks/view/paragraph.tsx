// Prose with inline math, drawn from its layout (layout/paragraph.ts): each
// wrapped row as tall as its tallest formula, the text on the row's text row.

import type { RenderElement } from 'claude-code'

import type { Formula, LaidLine } from '../layout/paragraph'
import type { Line } from '../layout/wrap'
import { CODE } from '../look'
import { image, type Ui } from './parts'

// One wrapped row. Text sits on the row's text row, `row.above` rows down; a
// formula's own rows above its text row line up with it.
function drawWrapped(ui: Ui, row: Line<Formula>, lead: RenderElement[]): RenderElement[] {
  const { Box, Text } = ui
  return [
    ...lead,
    ...row.pieces.map(piece =>
      piece.kind === 'text' ? (
        <Box marginTop={row.above}>
          <Text bold={piece.bold} italic={piece.italic} dimColor={piece.dim} color={piece.code ? CODE : undefined}>
            {piece.text}
          </Text>
        </Box>
      ) : (
        <Box marginTop={row.above - piece.above}>
          {image(ui, piece.box.picture, piece.columns, piece.box.rows, piece.box.source)}
        </Box>
      ),
    ),
  ]
}

// A paragraph line: a heading, a list item or quote with its marker, or plain
// prose; a list item's later rows hang under its text.
function drawLine(ui: Ui, line: LaidLine): RenderElement {
  const { Box, Text } = ui
  return (
    <Box flexDirection="column" paddingLeft={line.indent}>
      {line.rows.map((row, i) => {
        const marker =
          i === 0 && line.prefix
            ? [
                <Box marginTop={row.above}>
                  <Text dimColor={line.quote}>{line.prefix}</Text>
                </Box>,
              ]
            : []
        return (
          <Box flexDirection="row" alignItems="flex-start" paddingLeft={i === 0 ? 0 : line.hang}>
            {drawWrapped(ui, row, marker)}
          </Box>
        )
      })}
    </Box>
  )
}

/** Prose with inline math, as laid out. */
export function drawLines(ui: Ui, lines: LaidLine[]): RenderElement {
  return <ui.Box flexDirection="column">{lines.map(line => drawLine(ui, line))}</ui.Box>
}
