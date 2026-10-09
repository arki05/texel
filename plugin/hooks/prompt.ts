// What texel tells the model, as a section of the system prompt: that this
// terminal typesets math, and typst blocks only where typst is there to
// render them, diagrams from packages only where they may be imported.
// Pure: what texel can draw with, the section's text out.

/** The section's id: a plugin's own is `<plugin>:<name>`. */
export const PROMPT_SECTION = 'texel:math'

export function promptNote({ typst, packages }: { typst: boolean; packages: boolean }) {
  const lines = [
    'This terminal typesets LaTeX math in your replies (the texel plugin).',
    'Write inline math as \\( ... \\) and display math as \\[ ... \\] on lines of their own; $ ... $ and $$ ... $$ also work.',
    'Use math where it makes an explanation clearer, as you would in a written answer.',
  ]
  if (typst) {
    lines.push(
      packages
        ? 'A fenced ```typst block is typeset by typst and shown as a picture at the terminal\'s width: use one for a diagram (cetz, fletcher), a table or a typeset derivation.'
        : 'A fenced ```typst block is typeset by typst and shown as a picture at the terminal\'s width: use one for a table or a typeset derivation; it cannot import packages here.',
      'Its text cannot be selected or copied, so keep code, commands and anything to copy out of it.',
      'Leave out page setup (#set page): the picture is sized to fit the terminal.',
    )
  }
  return lines.join('\n')
}
