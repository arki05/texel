// A picture on its own: display math or a typst block, centred, at its own
// size. Exported for anything that shows a single rendered job.

import type { RenderElement } from 'claude-code'

import { isFailure, verdict } from '../render/result'
import type { DrawJob } from '../render/renderer'
import { image, readyOr, sourceWithNote, type ViewContext } from './parts'

/**
 * `job`'s picture, or its `source` until the picture exists. A block keeps its
 * own size: one wider than the transcript shows its source until there is room.
 */
export async function drawBlock(ctx: ViewContext, job: DrawJob, source: string, alt: string): Promise<RenderElement> {
  const { Box, Markdown } = ctx.ui
  const drawn = await readyOr(
    ctx,
    () => ctx.renderer.known.picture(job),
    () => ctx.renderer.fresh.picture(job),
  )
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
