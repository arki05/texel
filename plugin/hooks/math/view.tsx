// Draws parsed segments as a transcript tree: the engine's Markdown for prose,
// pipeline Images for math and typst, and wrapped rows for inline math.

import type { Elements, RenderElement } from 'claude-code'

import { isFailure, render, type Env, type Job, type Rendered, type RenderFailure } from '../render/pipeline'
import type { InlineLine, Segment } from './parse'

type Table = Elements['terminal']

type Context = { env: Env; ui: Table; columns: number }

function image(ui: Table, result: Rendered, alt: string) {
  const { Image } = ui
  return <Image source={{ file: result.file, format: 'png' }} columns={result.columns} rows={result.rows} alt={alt} />
}

async function drawBlock(ctx: Context, job: Job, source: string, alt: string) {
  const { Box, Markdown, Text } = ctx.ui
  const result = await render(ctx.env, job, ctx.columns)
  if (isFailure(result)) {
    return (
      <Box flexDirection="column">
        <Markdown text={source} />
        <Text dimColor>{`render failed: ${result.error.split('\n')[0]}`}</Text>
      </Box>
    )
  }
  return (
    <Box justifyContent="center" width="100%">
      {image(ctx.ui, result, alt)}
    </Box>
  )
}

async function drawLine(ctx: Context, line: InlineLine) {
  const { Box, Text } = ctx.ui
  const maxColumns = Math.max(8, ctx.columns - line.indent - line.prefix.length)
  const rendered = await Promise.all(
    line.atoms.map(atom =>
      atom.kind === 'math'
        ? render(ctx.env, { kind: 'inline', tex: atom.tex, style: atom.display ? 'display' : 'text' }, maxColumns)
        : null,
    ),
  )

  // One flex item per word (its trailing space kept) so the row wraps like prose.
  const items: RenderElement[] = []
  if (line.prefix) items.push(<Text dimColor={line.prefix === '│ '}>{line.prefix}</Text>)
  line.atoms.forEach((atom, i) => {
    if (atom.kind === 'math') {
      const result = rendered[i]
      items.push(result && !isFailure(result) ? image(ctx.ui, result, `\\(${atom.tex}\\)`) : <Text>{`\\(${atom.tex}\\)`}</Text>)
      return
    }
    for (const word of atom.text.split(/(?<=\s)(?=\S)/)) {
      items.push(
        <Text bold={atom.bold} italic={atom.italic} color={atom.code ? 'permission' : undefined}>
          {word.replace(/\s+/g, ' ')}
        </Text>,
      )
    }
  })

  return (
    // Centred: in a line holding display-style math (three rows), the text and
    // every one-row formula land on the middle row.
    <Box flexDirection="row" flexWrap="wrap" alignItems="center" paddingLeft={line.indent} width="100%">
      {items}
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
export async function draw(env: Env, ui: Table, segments: Segment[], { columns, background }: { columns: number; background?: string }) {
  const { Box } = ui
  const ctx: Context = { env, ui, columns: Math.max(8, background ? columns - 2 : columns) }
  const drawn = await Promise.all(segments.map(segment => drawSegment(ctx, segment)))
  return (
    <Box flexDirection="column" gap={1} backgroundColor={background} paddingX={background ? 1 : 0}>
      {drawn}
    </Box>
  )
}
