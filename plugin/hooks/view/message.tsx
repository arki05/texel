// One message (a transcript row), drawn from its layout (layout/message.ts):
// the engine's Markdown for plain prose and for source, texel's own lines
// for prose with inline math, and pictures for blocks, centred. A block with
// a handle gets its controls, over the right end of its first row while the
// pointer is on it, picture or source.

import type { RenderElement, UiPressArgument } from 'claude-code'

import type { BlockHandle, Laid } from '../layout/message'
import { drawLines } from './paragraph'
import { image, sourceWithNote, type Ui } from './parts'

/** What a block's controls do; the hooks module's, as they need `$`. */
export type BlockControls = {
  /** Draws the block `by` times as large; 0 draws it at its settings' size again. */
  zoom(key: string, by: number): void
  toggleSource(key: string): void
  /** Puts `text` on the clipboard of the surface the press came from. */
  copy(text: string, press: UiPressArgument): void
}

/** How much a press of − or + changes a block's size. */
const ZOOM_STEP = 1.25

/**
 * What a block shows: its picture; its source, asked for; or its source in
 * its picture's place (on its way, failed, refused, past the message's budget).
 */
type Showing = 'picture' | 'source' | 'fallback'

// A block's controls, one row of dim glyphs and words, those that do
// something for what it shows: zoom on a picture, back to it from its source
// asked for, `1:1` from a fallback a zoom brought about (too large, say);
// copy on all. `at` tells apart two drawings of one block in a message.
function controlBar(ui: Ui, block: BlockHandle, showing: Showing, controls: BlockControls, at: number): RenderElement {
  const { Box, Button, Text } = ui
  const id = `texel:${block.key}:${at}`
  const zoomable = block.zoomable && showing === 'picture'
  const buttons = [
    ...(zoomable
      ? [
          <Button key={`${id}:smaller`} label="−" plain dimColor onPress={() => controls.zoom(block.key, 1 / ZOOM_STEP)} />,
          <Text dimColor>{`${Math.round(block.zoom * 100)}%`}</Text>,
          <Button key={`${id}:larger`} label="+" plain dimColor onPress={() => controls.zoom(block.key, ZOOM_STEP)} />,
        ]
      : []),
    ...(zoomable || (showing === 'fallback' && block.zoom !== 1) ? [<Button key={`${id}:reset`} label="1:1" plain dimColor onPress={() => controls.zoom(block.key, 0)} />] : []),
    ...(showing === 'fallback' ? [] : [<Button key={`${id}:source`} label={showing === 'source' ? 'render' : 'source'} plain dimColor onPress={() => controls.toggleSource(block.key)} />]),
    <Button key={`${id}:copy`} label="copy" plain dimColor onPress={press => controls.copy(block.body, press)} />,
  ]
  return (
    <Box flexDirection="row" gap={1}>
      {buttons}
    </Box>
  )
}

// `body` with `block`'s controls floating over its first row's right end,
// shown while the pointer is on it: nothing moves when they appear.
function withControls(ui: Ui, body: RenderElement, block: BlockHandle, showing: Showing, controls: BlockControls, at: number) {
  return (
    <ui.Box key={`texel:${block.key}:${at}:row`} flexDirection="column" width="100%">
      {body}
      <ui.Box position="absolute" top={0} right={0} display="none" hover={{ display: 'flex' }}>
        {controlBar(ui, block, showing, controls, at)}
      </ui.Box>
    </ui.Box>
  )
}

function drawPart(ui: Ui, part: Laid, at: number, controls?: BlockControls): RenderElement {
  switch (part.kind) {
    case 'markdown':
      return <ui.Markdown text={part.text} />
    case 'lines':
      return drawLines(ui, part.lines)
    case 'picture': {
      const row = (
        <ui.Box justifyContent="center" width="100%">
          {image(ui, part.rendered, part.alt)}
        </ui.Box>
      )
      return part.block && controls ? withControls(ui, row, part.block, 'picture', controls, at) : row
    }
    case 'source': {
      const source = part.note ? sourceWithNote(ui, part.source, part.note) : <ui.Markdown text={part.source} />
      if (!part.block || !controls) return source
      return withControls(ui, source, part.block, part.block.source ? 'source' : 'fallback', controls, at)
    }
  }
}

/**
 * The tree for one message. `background` paints it (a prompt's row), with a
 * column of padding either side, which its layout left room for.
 */
export function drawMessage(ui: Ui, laid: Laid[], background?: string, controls?: BlockControls): RenderElement {
  return (
    <ui.Box flexDirection="column" gap={1} backgroundColor={background} paddingX={background ? 1 : 0}>
      {laid.map((part, at) => drawPart(ui, part, at, controls))}
    </ui.Box>
  )
}
