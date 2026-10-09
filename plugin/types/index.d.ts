// texel's contract: the session state it keeps in `$.state`, which outlives
// a reload of its code (a change of settings reloads it).

/** Whether `/texel source` shows every message as its source. */
export type TexelShowingSource = boolean

declare module 'claude-code' {
  interface PluginState {
    texel: { showingSource: TexelShowingSource }
  }
}
