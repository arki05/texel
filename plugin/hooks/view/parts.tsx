// What more than one part of the view draws: a picture, and source with a
// note saying why it is not one.

import type { Elements, RenderElement } from 'claude-code'

import type { Picture } from '../render/result'

/** The terminal surface's elements, which every part of the view draws with. */
export type Ui = Elements['terminal']

/**
 * A picture at its own size. An Image is scaled to whatever box it gets, so
 * its box never shrinks; past the edge (mid-resize, say) it is clipped instead.
 */
export function image(ui: Ui, picture: Picture, columns: number, rows: number, alt: string): RenderElement {
  const { Box, Image } = ui
  return (
    <Box flexShrink={0}>
      <Image source={'file' in picture ? { file: picture.file, format: 'png' } : picture} columns={columns} rows={rows} alt={alt} />
    </Box>
  )
}

/** Source drawn as the engine draws markdown, with a dim line saying why it is not a picture. */
export function sourceWithNote(ui: Ui, source: string, note: string): RenderElement {
  const { Box, Markdown, Text } = ui
  return (
    <Box flexDirection="column">
      <Markdown text={source} />
      <Text dimColor>{note}</Text>
    </Box>
  )
}
