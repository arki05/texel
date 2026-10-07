// One transcript row, drawn from its parsed segments: the engine's Markdown
// for plain prose, texel's own lines for prose with inline math, and pictures
// for display math and typst blocks.

import type { RenderElement } from 'claude-code'

import type { Segment } from '../markdown/parse'
import { isFailure, type DrawJob } from '../render/renderer'
import { drawParagraph } from './paragraph'
import { image, reason, sourceWithNote, type ViewContext } from './parts'

// A block never holds up its row: until its picture for this width exists the
// row shows its source, and a render started in the background redraws it.
// A block keeps its own size; one wider than the transcript waits for room.
async function drawBlock(ctx: ViewContext, job: DrawJob, source: string, alt: string): Promise<RenderElement> {
  const { Box, Markdown } = ctx.ui
  const drawn = await ctx.renderer.peek(job, ctx.columns)
  if (!drawn) {
    void ctx.renderer.render(job, ctx.columns).then(ctx.redraw)
    return <Markdown text={source} />
  }
  if (isFailure(drawn)) return sourceWithNote(ctx.ui, source, `render failed: ${reason(drawn)}`)
  if (drawn.columns > ctx.columns) {
    return sourceWithNote(ctx.ui, source, `wider than the transcript (${drawn.columns} > ${ctx.columns} columns)`)
  }
  return (
    <Box justifyContent="center" width="100%">
      {image(ctx.ui, drawn.file, drawn.columns, drawn.rows, alt)}
    </Box>
  )
}

function drawSegment(ctx: ViewContext, segment: Segment): Promise<RenderElement> | RenderElement {
  switch (segment.kind) {
    case 'markdown':
      return <ctx.ui.Markdown text={segment.text} />
    case 'display':
      return drawBlock(ctx, { kind: 'display', tex: segment.tex }, segment.source, segment.tex)
    case 'typst':
      return drawBlock(ctx, { kind: 'block', typst: segment.code }, segment.source, 'typst block')
    case 'paragraph':
      return drawParagraph(ctx, segment.lines)
  }
}

/**
 * The tree for one transcript row. `background` paints it (a prompt's row),
 * with a column of padding either side.
 */
export async function drawMessage(ctx: ViewContext, segments: Segment[], background?: string) {
  const { Box } = ctx.ui
  const inner = background ? { ...ctx, columns: Math.max(8, ctx.columns - 2) } : ctx
  const drawn = await Promise.all(segments.map(segment => drawSegment(inner, segment)))
  return (
    <Box flexDirection="column" gap={1} backgroundColor={background} paddingX={background ? 1 : 0}>
      {drawn}
    </Box>
  )
}
