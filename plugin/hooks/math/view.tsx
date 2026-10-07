// Draws parsed segments as a transcript tree: the engine's Markdown for prose,
// pipeline Images for math and typst, and our own wrapped lines for prose
// with inline math, each line as tall as its tallest formula needs.

import type { Elements, RenderElement } from 'claude-code'

import { cached, isFailure, measureInline, render, type Env, type Job, type RenderFailure } from '../render/pipeline'
import { fitInline, type FitOptions } from './fit'
import type { InlineLine, Segment } from './parse'
import { cells, wrap, type Piece } from './wrap'

type Table = Elements['terminal']

/** `redraw` asks the engine to draw the rows again, once a background render is done. */
type Context = { env: Env; ui: Table; columns: number; fit: FitOptions; redraw: () => void }

/** An inline formula, rendered: what a line's box piece carries. */
type Formula = { file: string; rows: number; tex: string }

// A picture keeps its size: an Image is scaled to whatever box it gets, so its
// box never shrinks; past the edge (mid-resize, say) it is clipped instead.
function image(ui: Table, file: string, columns: number, rows: number, alt: string) {
  const { Box, Image } = ui
  return (
    <Box flexShrink={0}>
      <Image source={{ file, format: 'png' }} columns={columns} rows={rows} alt={alt} />
    </Box>
  )
}

function sourceWithNote(ui: Table, source: string, note: string) {
  const { Box, Markdown, Text } = ui
  return (
    <Box flexDirection="column">
      <Markdown text={source} />
      <Text dimColor>{note}</Text>
    </Box>
  )
}

// A block never holds up its row: until its picture for this width exists, the
// row shows its source, and a background render redraws the row when done.
async function drawBlock(ctx: Context, job: Job, source: string, alt: string) {
  const { Box, Markdown } = ctx.ui
  const result = await cached(ctx.env, job, ctx.columns)
  if (!result) {
    void render(ctx.env, job, ctx.columns).then(ctx.redraw)
    return <Markdown text={source} />
  }
  if (isFailure(result)) return sourceWithNote(ctx.ui, source, `render failed: ${result.error.split('\n')[0]}`)
  // Never scaled to fit: wider than the transcript, it waits for the room.
  if (result.columns > ctx.columns) {
    return sourceWithNote(ctx.ui, source, `wider than the transcript (${result.columns} > ${ctx.columns} columns)`)
  }
  return (
    <Box justifyContent="center" width="100%">
      {image(ctx.ui, result.file, result.columns, result.rows, alt)}
    </Box>
  )
}

// A failed formula's source, then why, dim: typst's first line, cut short.
function failed(tex: string, failure: RenderFailure): Piece<Formula>[] {
  const reason = failure.error.split('\n')[0]!.replace(/^error:\s*/, '')
  const short = reason.length > 60 ? `${reason.slice(0, 59)}…` : reason
  return [
    { kind: 'text', text: `\\(${tex}\\)` },
    { kind: 'text', text: ` (${short})`, dim: true },
  ]
}

// Measured, fitted into the line, then drawn as fitted; its source and the
// reason if any step fails.
async function formula(ctx: Context, tex: string, maxColumns: number): Promise<Piece<Formula>[]> {
  const ink = await measureInline(ctx.env, tex)
  if (isFailure(ink)) return failed(tex, ink)
  const fit = fitInline(ink, ctx.env.theme, maxColumns, ctx.fit)
  const rows = 1 + fit.above + fit.below
  const placement = { columns: fit.columns, rows, scale: fit.scale, dy: fit.dy }
  const result = await render(ctx.env, { kind: 'inline', tex, placement }, maxColumns)
  if (isFailure(result)) return failed(tex, result)
  return [{ kind: 'box', columns: result.columns, above: fit.above, below: fit.below, box: { file: result.file, rows: result.rows, tex } }]
}

async function drawLine(ctx: Context, line: InlineLine) {
  const { Box, Text } = ctx.ui
  // A list item's continuation lines hang under its text, not its marker.
  const hang = cells(line.prefix)
  const width = Math.max(8, ctx.columns - line.indent - hang)
  const pieces = (
    await Promise.all(line.atoms.map(atom => (atom.kind === 'math' ? formula(ctx, atom.tex, width) : [atom as Piece<Formula>])))
  ).flat()

  // Text sits on each line's text row, `above` rows down; a formula's own
  // rows above that row line up with it.
  return (
    <Box flexDirection="column" paddingLeft={line.indent}>
      {wrap(pieces, width).map((row, i) => {
        const items: RenderElement[] = []
        if (i === 0 && line.prefix) {
          items.push(
            <Box marginTop={row.above}>
              <Text dimColor={line.prefix === '│ '}>{line.prefix}</Text>
            </Box>,
          )
        }
        for (const piece of row.pieces) {
          items.push(
            piece.kind === 'text' ? (
              <Box marginTop={row.above}>
                <Text bold={piece.bold} italic={piece.italic} dimColor={piece.dim} color={piece.code ? 'permission' : undefined}>
                  {piece.text}
                </Text>
              </Box>
            ) : (
              <Box marginTop={row.above - piece.above}>
                {image(ctx.ui, piece.box.file, piece.columns, piece.box.rows, `\\(${piece.box.tex}\\)`)}
              </Box>
            ),
          )
        }
        return (
          <Box flexDirection="row" alignItems="flex-start" paddingLeft={i === 0 ? 0 : hang}>
            {items}
          </Box>
        )
      })}
    </Box>
  )
}

async function drawSegment(ctx: Context, segment: Segment) {
  const { Box, Markdown } = ctx.ui
  switch (segment.kind) {
    case 'markdown':
      return <Markdown text={segment.text} />
    case 'display':
      return drawBlock(ctx, { kind: 'display', tex: segment.tex }, segment.source, segment.tex)
    case 'typst':
      return drawBlock(ctx, { kind: 'block', typst: segment.code }, segment.source, 'typst block')
    case 'paragraph':
      return <Box flexDirection="column">{await Promise.all(segment.lines.map(line => drawLine(ctx, line)))}</Box>
  }
}

/**
 * The tree for one transcript row. `background` paints the row (a prompt's),
 * with a column of padding either side.
 */
export async function draw(
  env: Env,
  ui: Table,
  segments: Segment[],
  { columns, fit, redraw, background }: { columns: number; fit: FitOptions; redraw: () => void; background?: string },
) {
  const { Box } = ui
  const ctx: Context = { env, ui, fit, redraw, columns: Math.max(8, background ? columns - 2 : columns) }
  const drawn = await Promise.all(segments.map(segment => drawSegment(ctx, segment)))
  return (
    <Box flexDirection="column" gap={1} backgroundColor={background} paddingX={background ? 1 : 0}>
      {drawn}
    </Box>
  )
}
