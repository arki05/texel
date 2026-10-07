// One message (a transcript row), drawn from its parsed segments: the engine's
// Markdown for plain prose, texel's own lines for prose with inline math, and
// pictures for display math and typst blocks.

import type { RenderElement } from 'claude-code'

import type { Segment } from '../markdown/parse'
import { drawBlock } from './block'
import { drawParagraph } from './paragraph'
import type { ViewContext } from './parts'

function drawSegment(ctx: ViewContext, segment: Segment): Promise<RenderElement> | RenderElement {
  switch (segment.kind) {
    case 'markdown':
      return <ctx.ui.Markdown text={segment.text} />
    case 'display':
      return drawBlock(ctx, { kind: 'display', tex: segment.tex }, segment.source, segment.tex)
    case 'typst':
      return drawBlock(ctx, { kind: 'typst', typst: segment.code, maxColumns: ctx.columns }, segment.source, 'typst block')
    case 'paragraph':
      return drawParagraph(ctx, segment.lines, segment.source)
  }
}

/**
 * The tree for one message. `background` paints it (a prompt's row), with a
 * column of padding either side.
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
