// Accented Latin letters in TeX's text, as accents MathJax can draw. Its
// fonts have no precomposed é or ü, but they draw TeX's accents over a
// letter, which textmacros reads in \text{…}. Pure: TeX in, TeX out.

// The accents MathJax's fonts draw over a letter, by the combining mark Unicode decomposes them to.
const ACCENTS: Record<string, string> = {
  '\u0300': '`', '\u0301': "'", '\u0302': '^', '\u0303': '~', '\u0304': '=',
  '\u0306': 'u', '\u0307': '.', '\u0308': '"', '\u030C': 'v',
}

// A text-mode argument's opening: \text{, \textbf{, \mbox{ and the like.
const TEXT_ARGUMENT = /\\(?:text(?:rm|it|bf|sf|tt|up|sl|md|normal)?|mbox|hbox)\s*\{/g

/**
 * `tex` with the accented Latin letters in its text (\text{…} and the like,
 * outside any $…$ in it), which MathJax's fonts lack, as the TeX accents
 * they draw: `\text{für}` as `\text{f{\"{u}}r}`. A letter in math, one with an
 * accent they cannot draw, or an i or j (whose dot TeX drops first) stays as
 * it is, and fails naming itself.
 */
export function accented(tex: string): string {
  let out = ''
  let from = 0
  for (const match of tex.matchAll(TEXT_ARGUMENT)) {
    if (match.index < from) continue
    const open = match.index + match[0].length
    const close = closingBrace(tex, open)
    if (close === undefined) break
    const text = tex.slice(open, close).split(/(?<!\\)(\$[^$]*\$)/)
    out += tex.slice(from, open) + text.map((part, i) => (i % 2 ? part : part.replace(/[À-ſ]/g, accent))).join('')
    from = close
  }
  return out + tex.slice(from)
}

function accent(letter: string): string {
  const [base = '', ...marks] = letter.normalize('NFD')
  const command = marks.length === 1 ? ACCENTS[marks[0]!] : undefined
  return command && /^[a-hk-zA-Z]$/.test(base) ? `{\\${command}{${base}}}` : letter
}

// The index of the brace that closes one opened just before `at`, escaped braces skipped.
function closingBrace(tex: string, at: number): number | undefined {
  let depth = 1
  for (let i = at; i < tex.length; i++) {
    if (tex[i] === '\\') i++
    else if (tex[i] === '{') depth++
    else if (tex[i] === '}' && --depth === 0) return i
  }
  return undefined
}
