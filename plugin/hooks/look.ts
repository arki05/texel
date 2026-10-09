// Claude Code's look, where texel draws in its place: the colours and the
// gutter its own transcript uses. No theme key names these, so they are
// copied (from Claude Code 2.1.29x) and kept here, the one place to update
// when Claude Code changes them.

export type Theme = 'dark' | 'light'

/** The text's colour, six hex digits: what math and typst take when no colour is set for them. */
export const TEXT: Record<Theme, string> = { dark: 'e6e6e6', light: '1f1f1f' }

/** A prompt row's background. */
export const PROMPT_BACKGROUND: Record<Theme, string> = { dark: 'rgb(55, 55, 55)', light: 'rgb(240, 240, 240)' }

/** The gutter beside a reply (`⏺ `), and a column to spare. */
export const GUTTER = 4

/** Inline code's colour, as the engine's Markdown draws it: a theme key. */
export const CODE = 'permission'
