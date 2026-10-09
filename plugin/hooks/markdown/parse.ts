// Splits a message's markdown (a reply, or the person's prompt) into what the
// engine can draw as-is and what texel should turn into pictures. Pure: no
// `$`, no I/O.

/** How a run of text is drawn. */
export type TextStyle = { bold?: boolean; italic?: boolean; code?: boolean }

/** Prose, or a formula: its TeX, and its source as written (`$x$`, `\(x\)`), which a failed one shows. */
export type Atom = ({ kind: 'text'; text: string } & TextStyle) | { kind: 'math'; tex: string; source: string }

export type InlineLine = {
  /** What leads the line: a list marker, a quote bar, or nothing. */
  prefix: string
  /** A quote's line, whose bar is drawn dim. */
  quote?: true
  indent: number
  atoms: Atom[]
}

/** What draws a block: MathJax (display math), or typst (a typst block). */
export type BlockKind = 'math' | 'typst'

export type Segment =
  | { kind: 'markdown'; text: string }
  /** Prose with inline math. */
  | { kind: 'paragraph'; lines: InlineLine[]; source: string }
  /** Display math or a typst block: its body, and its source as written. */
  | { kind: 'block'; renderer: BlockKind; body: string; source: string }

// The fences that are blocks, by language: ```math is a formula, as on
// GitHub; ```latex and ```tex are LaTeX source to read or copy, and stay code.
const FENCES: Record<string, BlockKind> = { math: 'math', typst: 'typst', typ: 'typst' }

// Before a delimiter: no backslash, or an even run of them, each pair an
// escaped backslash, so `\\(` is a backslash and a parenthesis.
const UNESCAPED = String.raw`(?<=(?:^|[^\\])(?:\\\\)*)`

// `$…$` follows pandoc's rule: no space just inside either dollar, and no digit
// right after the closing one, so "$5 and $10" stays prose; `\$` is a dollar.
const INLINE_DOLLAR = String.raw`(?<![\\$\w])\$(?=[^\s$])(?<dollar>(?:\\\$|[^$\n])+?)(?<=[^\s\\])\$(?![\d$])`
// One lazy run to the closer, so a line of unclosed `\(` costs linear time
// at each; `\( \)` around nothing but spaces is left as text (tokenizeProse).
const INLINE_PAREN = String.raw`${UNESCAPED}\\\((?<paren>[^\n]*?)\\\)`
const HAS_INLINE = new RegExp(`${INLINE_DOLLAR}|${INLINE_PAREN}`)
// Display math is always a block of its own, as in LaTeX: mid-sentence it splits
// the paragraph. It never crosses a blank line, so one stray `$$` cannot swallow
// the prose up to the next formula.
const NO_BREAK = String.raw`(?:(?!\n[ \t]*\n)[\s\S])`
const DISPLAY = new RegExp(String.raw`(?<!\\)\$\$${NO_BREAK}+?\$\$|${UNESCAPED}\\\[${NO_BREAK}+?\\\]`, 'g')

// A code span, like display math, ends at a paragraph break.
const CODE_SPAN = new RegExp(String.raw`(\x60+)([^\x60]${NO_BREAK}*?)\1(?!\x60)`, 'g')

// Math, emphasis and links; a delimiter escaped with a backslash is no delimiter.
const TOKEN = new RegExp(
  [
    INLINE_PAREN,
    INLINE_DOLLAR,
    String.raw`(?<!\\)\*\*(?<bold>.+?)(?<!\\)\*\*`,
    String.raw`(?<!\\)__(?<boldUnderscored>.+?)(?<!\\)__`,
    String.raw`(?<![\\\w*])\*(?![\s*])(?<italic>.+?)(?<![\s\\])\*(?![\w*])`,
    String.raw`(?<![\\\w_])_(?![\s_])(?<italicUnderscored>.+?)(?<![\s\\])_(?![\w_])`,
    String.raw`(?<!\\)\[(?<link>[^\]]+)\]\([^)]+\)`,
  ].join('|'),
  'g',
)

// Markdown's backslash escapes of punctuation (`\*`, `\_`, `\$`), shown as the character.
const unescape = (text: string) => text.replace(/\\([!-/:-@[-`{-~])/g, '$1')

type Emphasis = Pick<TextStyle, 'bold' | 'italic'>

function tokenizeProse(text: string, style: Emphasis): Atom[] {
  const atoms: Atom[] = []
  const pushText = (t: string) => {
    if (t) atoms.push({ kind: 'text', text: unescape(t), ...style })
  }
  let last = 0
  for (const m of text.matchAll(TOKEN)) {
    pushText(text.slice(last, m.index))
    last = m.index + m[0].length
    const { paren, dollar, bold, boldUnderscored, italic, italicUnderscored, link } = m.groups!
    const tex = (paren ?? dollar)?.trim()
    const strong = bold ?? boldUnderscored
    const emphasis = italic ?? italicUnderscored
    if (tex) atoms.push({ kind: 'math', tex, source: m[0] })
    else if (tex === '') pushText(m[0])
    else if (strong !== undefined) atoms.push(...tokenizeProse(strong, { ...style, bold: true }))
    else if (emphasis !== undefined) atoms.push(...tokenizeProse(emphasis, { ...style, italic: true }))
    else if (link !== undefined) atoms.push(...tokenizeProse(link, style))
  }
  pushText(text.slice(last))
  return atoms
}

// Code spans first, so nothing inside one is ever math or emphasis.
export function tokenize(text: string, style: Emphasis = {}): Atom[] {
  const atoms: Atom[] = []
  let last = 0
  for (const m of text.matchAll(CODE_SPAN)) {
    atoms.push(...tokenizeProse(text.slice(last, m.index), style))
    atoms.push({ kind: 'text', text: m[2] ?? '', ...style, code: true })
    last = m.index + m[0].length
  }
  atoms.push(...tokenizeProse(text.slice(last), style))
  return atoms
}

function hasInlineMath(paragraph: string) {
  const withoutCode = paragraph.replace(CODE_SPAN, '')
  return HAS_INLINE.test(withoutCode)
}

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/

// Tables and indented code keep the engine's drawing (their math stays
// source). In a list, an indented line is a nested item or a continuation,
// not code.
function isLayoutable(paragraph: string) {
  const lines = paragraph.split('\n')
  const isList = lines.some(line => LIST_ITEM.test(line))
  return !lines.some(line => /^\s*\|/.test(line) || (!isList && /^( {4}|\t)/.test(line)))
}

function paragraphLines(paragraph: string): InlineLine[] {
  const lines: { prefix: string; quote?: true; indent: number; heading: boolean; text: string }[] = []
  for (const raw of paragraph.split('\n')) {
    const heading = raw.match(/^#{1,6}\s+(.*)$/)
    const item = raw.match(LIST_ITEM)
    const quote = raw.match(/^>\s?(.*)$/)
    const last = lines[lines.length - 1]
    if (heading) lines.push({ prefix: '', indent: 0, heading: true, text: heading[1]! })
    else if (item) {
      const [, indent = '', bullet = '', rest = ''] = item
      const marker = /\d/.test(bullet) ? `${bullet} ` : '• '
      lines.push({ prefix: marker, indent: indent.length, heading: false, text: rest })
    } else if (quote) lines.push({ prefix: '│ ', quote: true, indent: 0, heading: false, text: quote[1] ?? '' })
    // A heading is one line: what follows it starts its own.
    else if (last && !last.heading && raw.trim()) last.text += ` ${raw.trim()}`
    else if (raw.trim()) lines.push({ prefix: '', indent: 0, heading: false, text: raw.trim() })
  }
  // A heading's line is set in bold.
  return lines.map(({ text, heading, ...rest }) => ({ ...rest, atoms: tokenize(text, heading ? { bold: true } : {}) }))
}

// Prose, paragraph by paragraph: its own layout where it holds math that
// will render, the engine's markdown otherwise.
function proseSegments(text: string): Segment[] {
  return text
    .split(/\n[ \t]*\n/)
    .filter(paragraph => paragraph.trim())
    .map((paragraph): Segment => {
      const lines = hasInlineMath(paragraph) && isLayoutable(paragraph) ? paragraphLines(paragraph) : []
      const hasMath = lines.some(line => line.atoms.some(atom => atom.kind === 'math'))
      return hasMath ? { kind: 'paragraph', lines, source: paragraph } : { kind: 'markdown', text: paragraph }
    })
}

// Code spans blanked out at equal length, so delimiters inside them never match
// and every index still points into the original text.
function maskCode(text: string) {
  return text.replace(CODE_SPAN, span => '\uE000'.repeat(span.length))
}

// Text outside fences: its display math, each a block, and the prose around it.
function nonFenced(text: string): Segment[] {
  const out: Segment[] = []
  let last = 0
  for (const m of maskCode(text).matchAll(DISPLAY)) {
    const source = text.slice(m.index, m.index + m[0].length)
    const tex = source.trim().slice(2, -2).trim()
    if (!tex) continue
    out.push(...proseSegments(text.slice(last, m.index)), { kind: 'block', renderer: 'math', body: tex, source })
    last = m.index + m[0].length
  }
  return [...out, ...proseSegments(text.slice(last))]
}

// Neighbouring markdown segments as one, as the engine would draw them.
function joinMarkdown(segments: Segment[]): Segment[] {
  const out: Segment[] = []
  for (const segment of segments) {
    const prev = out.at(-1)
    if (segment.kind === 'markdown' && prev?.kind === 'markdown') out[out.length - 1] = { kind: 'markdown', text: `${prev.text}\n\n${segment.text}` }
    else out.push(segment)
  }
  return out
}

export function parse(reply: string): Segment[] {
  // Windows and old Mac line ends, so a blank line is a paragraph break either way.
  const text = reply.replace(/\r\n?/g, '\n')
  const out: Segment[] = []
  const fence = /^([ \t]*)(`{3,}|~{3,})[ \t]*([\w+-]*)[^\n]*\n([\s\S]*?)^\1\2[ \t]*$/gm
  let last = 0
  for (const m of text.matchAll(fence)) {
    out.push(...nonFenced(text.slice(last, m.index)))
    last = m.index + m[0].length
    const lang = (m[3] ?? '').toLowerCase()
    const renderer = Object.hasOwn(FENCES, lang) ? FENCES[lang] : undefined
    out.push(renderer ? { kind: 'block', renderer, body: (m[4] ?? '').replace(/\n$/, ''), source: m[0] } : { kind: 'markdown', text: m[0] })
  }
  // A fence still streaming in has no close yet: keep it, and what follows, as source.
  const rest = text.slice(last)
  const open = rest.match(/^[ \t]*(`{3,}|~{3,})/m)
  if (open) out.push(...nonFenced(rest.slice(0, open.index)), { kind: 'markdown', text: rest.slice(open.index) })
  else out.push(...nonFenced(rest))
  return joinMarkdown(out)
}

/** Whether anything in `segments` needs rendering. */
export function needsRender(segments: Segment[]) {
  return segments.some(s => s.kind !== 'markdown')
}
