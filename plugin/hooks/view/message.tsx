// One message (a transcript row), drawn from its layout (layout/message.ts):
// the engine's Markdown for plain prose and for source, texel's own lines
// for prose with inline math, and pictures for blocks, centred.

import type { RenderElement } from 'claude-code'

import type { Laid } from '../layout/message'
import { drawLines } from './paragraph'
import { image, sourceWithNote, type Ui } from './parts'

function drawPart(ui: Ui, part: Laid): RenderElement {
  switch (part.kind) {
    case 'markdown':
      return <ui.Markdown text={part.text} />
    case 'lines':
      return drawLines(ui, part.lines)
    case 'picture': {
      const { picture, columns, rows } = part.rendered
      return (
        <ui.Box justifyContent="center" width="100%">
          {image(ui, picture, columns, rows, part.alt)}
        </ui.Box>
      )
    }
    case 'source':
      return part.note ? sourceWithNote(ui, part.source, part.note) : <ui.Markdown text={part.source} />
  }
}

/**
 * The tree for one message. `background` paints it (a prompt's row), with a
 * column of padding either side, which its layout left room for.
 */
export function drawMessage(ui: Ui, laid: Laid[], background?: string): RenderElement {
  return (
    <ui.Box flexDirection="column" gap={1} backgroundColor={background} paddingX={background ? 1 : 0}>
      {laid.map(part => drawPart(ui, part))}
    </ui.Box>
  )
}
