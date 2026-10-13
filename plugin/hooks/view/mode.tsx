// texel's label among the dim mode labels at the right of the prompt's
// footer: `texel: rendered` while messages are rendered, `texel: source` while they
// show their source; a click switches, as /texel source does.

import type { RenderElement } from 'claude-code'

import type { Ui } from './parts'

/** The footer's mode labels as the engine draws them (`engine`, with `hasModes` when there are any), and texel's after them. */
export function drawModes(ui: Ui, engine: RenderElement, hasModes: boolean, showingSource: boolean, toggle: () => void): RenderElement {
  const { Box, Button, Text } = ui
  // Joined to the engine's as they are to one another.
  const before = hasModes ? [engine, <Text dimColor>{' & '}</Text>] : []
  return (
    <Box flexDirection="row">
      {before}
      <Button key="texel:sources" label={showingSource ? 'texel: source' : 'texel: rendered'} plain dimColor={!showingSource} onPress={toggle} />
    </Box>
  )
}
