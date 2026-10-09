// A picture on its own: display math or a typst block, centred, at its own size.

import type { RenderElement } from 'claude-code'

import { isFailure, verdict, type Rendered, type RenderFailure } from '../render/result'
import { image, sourceWithNote, type ViewContext } from './parts'

/**
 * A block's picture, or its `source` while there is none yet. A block keeps
 * its own size: one wider than the transcript shows its source until there
 * is room.
 */
export function drawBlock(ctx: ViewContext, drawn: Rendered | RenderFailure | undefined, source: string, alt: string): RenderElement {
  const { Box, Markdown } = ctx.ui
  if (!drawn) return <Markdown text={source} />
  if (isFailure(drawn)) return sourceWithNote(ctx.ui, source, verdict(drawn))
  if (drawn.columns > ctx.columns) {
    return sourceWithNote(ctx.ui, source, `wider than the transcript (${drawn.columns} > ${ctx.columns} columns)`)
  }
  return (
    <Box justifyContent="center" width="100%">
      {image(ctx.ui, drawn.picture, drawn.columns, drawn.rows, alt)}
    </Box>
  )
}
