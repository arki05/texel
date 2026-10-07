// What every part of the view shares: the drawing's context, the one way a
// part waits for typst, and the elements more than one part draws.

import type { Elements, RenderElement } from 'claude-code'

import type { FitOptions } from '../layout/fit'
import type { Grid } from '../layout/geometry'
import type { Renderer } from '../render/renderer'

export type Table = Elements['terminal']

export type ViewContext = {
  ui: Table
  renderer: Renderer
  grid: Grid
  fit: FitOptions
  /** The columns a message's content may take. */
  columns: number
  /** Whether a typst block may import packages (the `typstPackages` setting). */
  typstPackages: boolean
  /** Draws the messages again: called once work started in the background is done. */
  redraw: () => void
}

/**
 * What `known` answers, if it can; otherwise `work` starts in the background
 * and redraws when done, and the answer is undefined meanwhile. A draw never
 * waits on typst: a hook that did could outlast its time and be drawn as
 * plain source, with nothing to draw it again.
 */
export async function readyOr<T>(ctx: ViewContext, known: () => Promise<T | undefined>, work: () => Promise<unknown>) {
  const ready = await known()
  if (ready !== undefined) return ready
  void work().then(ctx.redraw, ctx.redraw)
  return undefined
}

/**
 * A picture at its own size. An Image is scaled to whatever box it gets, so
 * its box never shrinks; past the edge (mid-resize, say) it is clipped instead.
 */
export function image(ui: Table, file: string, columns: number, rows: number, alt: string): RenderElement {
  const { Box, Image } = ui
  return (
    <Box flexShrink={0}>
      <Image source={{ file, format: 'png' }} columns={columns} rows={rows} alt={alt} />
    </Box>
  )
}

/** Source drawn as the engine draws markdown, with a dim line saying why it is not a picture. */
export function sourceWithNote(ui: Table, source: string, note: string): RenderElement {
  const { Box, Markdown, Text } = ui
  return (
    <Box flexDirection="column">
      <Markdown text={source} />
      <Text dimColor>{note}</Text>
    </Box>
  )
}
