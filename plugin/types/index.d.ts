// texel's contract: the session state it keeps in `$.state`, which outlives
// a reload of its code (a change of settings reloads it).

/** Whether `/texel source` shows every message as its source. */
export type TexelShowingSource = boolean

/**
 * One display block's own view: drawn `zoom` times as large as `typstScale`
 * makes it (typst blocks), or as its source.
 */
export type TexelBlockView = { zoom: number; source: boolean }

/** A message's blocks' views, by each block's kind and body's hash; a block not in it is drawn as its settings say. */
export type TexelBlockViews = Record<string, TexelBlockView>

declare module 'claude-code' {
  interface PluginState {
    texel: { showingSource: TexelShowingSource; blocks: StateFamily<TexelBlockViews> }
  }
}
