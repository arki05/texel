// What every part of the view shares: the drawing's context, and the elements
// more than one part draws.

import type { Elements, RenderElement } from 'claude-code'

import type { FitOptions } from '../layout/fit'
import type { RenderFailure, Renderer } from '../render/renderer'
import type { Grid } from '../render/typst'

export type Table = Elements['terminal']

export type ViewContext = {
  ui: Table
  renderer: Renderer
  grid: Grid
  fit: FitOptions
  /** The columns a row's content may take. */
  columns: number
  /** Draws the rows again: called once a render started in the background is done. */
  redraw: () => void
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

/** A failure's first line, without typst's `error:`, cut to `max` characters. */
export function reason(failure: RenderFailure, max = 200) {
  const line = failure.error.split('\n')[0]!.replace(/^error:\s*/, '')
  return line.length > max ? `${line.slice(0, max - 1)}…` : line
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
