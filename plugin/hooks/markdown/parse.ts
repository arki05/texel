// Splits a message's markdown (a reply, or the person's prompt) into what the
// engine can draw as-is and what texel should turn into pictures. Pure: no
// `$`, no I/O.

/** How a run of text is drawn; `dim` is texel's own, for notes. */
export type TextStyle = { bold?: boolean; italic?: boolean; code?: boolean; dim?: boolean }

/** Prose, or a formula: its TeX, and its source as written (`$x$`, `\(x\)`), which a failed one shows. */
export type Atom = ({ kind: 'text'; text: string } & TextStyle) | { kind: 'math'; tex: string; source: string }

export type InlineLine = {
  /** What leads the line: a list marker, a quote bar, or nothing. */
  prefix: string
  /** A quote's line, whose bar is drawn dim. */
  quote?: true
  indent: number
  heading: boolean
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
const INLINE_DOLLAR = String.raw`(?<![\\$\w])\$(?=[^\s$])((?:\\\$|[^$\n])+?)(?<=[^\s\\])\$(?![\d$])`
// One lazy run to the closer, so a line of unclosed `\(` costs linear time
// at each; `\( \)` around nothing but spaces is left as text (tokenizeProse).
const INLINE_PAREN = String.raw`${UNESCAPED}\\\(([^\n]*?)\\\)`
const HAS_INLINE = new RegExp(`${INLINE_DOLLAR}|${INLINE_PAREN}`)
// Display math is always a block of its own, as in LaTeX: mid-sentence it splits
// the paragraph. It never crosses a blank line, so one stray `$$` cannot swallow
// the prose up to the next formula.
const NO_BREAK = String.raw`(?:(?!\n[ \t]*\n)[\s\S])`
const DISPLAY = new RegExp(String.raw`(?<!\\)\$\$${NO_BREAK}+?\$\$|${UNESCAPED}\\\[${NO_BREAK}+?\\\]`, 'g')

// A code span, like display math, ends at a paragraph break.
const CODE_SPAN = new RegExp(String.raw`(\x60+)([^\x60]${NO_BREAK}*?)\1(?!\x60)`, 'g')

// Emphasis and links; a delimiter escaped with a backslash is no delimiter.
const TOKEN = new RegExp(
  [
    INLINE_PAREN, // 1
    INLINE_DOLLAR, // 2
    String.raw`(?<!\\)\*\*(.+?)(?<!\\)\*\*`, // 3 bold
    String.raw`(?<!\\)__(.+?)(?<!\\)__`, // 4 bold
    String.raw`(?<![\\\w*])\*(?![\s*])(.+?)(?<![\s\\])\*(?![\w*])`, // 5 italic
    String.raw`(?<![\\\w_])_(?![\s_])(.+?)(?<![\s\\])_(?![\w_])`, // 6 italic
    String.raw`(?<!\\)\[([^\]]+)\]\([^)]+\)`, // 7 link text
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
    if (m[1] !== undefined || m[2] !== undefined) {
      const tex = (m[1] ?? m[2])!.trim()
      if (tex) atoms.push({ kind: 'math', tex, source: m[0] })
      else pushText(m[0])
    }
    else if (m[3] !== undefined || m[4] !== undefined) atoms.push(...tokenizeProse((m[3] ?? m[4])!, { ...style, bold: true }))
    else if (m[5] !== undefined || m[6] !== undefined) atoms.push(...tokenizeProse((m[5] ?? m[6])!, { ...style, italic: true }))
    else if (m[7] !== undefined) atoms.push(...tokenizeProse(m[7], style))
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
  return lines.map(({ text, ...rest }) => ({ ...rest, atoms: tokenize(text, rest.heading ? { bold: true } : {}) }))
}

function proseSegments(text: string, out: Segment[]) {
  for (const paragraph of text.split(/\n[ \t]*\n/)) {
    if (!paragraph.trim()) continue
    const lines = hasInlineMath(paragraph) && isLayoutable(paragraph) ? paragraphLines(paragraph) : []
    // Only math that will render earns our own layout; the rest is the engine's.
    if (lines.some(line => line.atoms.some(atom => atom.kind === 'math'))) {
      out.push({ kind: 'paragraph', lines, source: paragraph })
    } else {
      pushMarkdown(out, paragraph)
    }
  }
}

function pushMarkdown(out: Segment[], text: string) {
  const prev = out[out.length - 1]
  if (prev?.kind === 'markdown') prev.text += `\n\n${text}`
  else out.push({ kind: 'markdown', text })
}

// Code spans blanked out at equal length, so delimiters inside them never match
// and every index still points into the original text.
function maskCode(text: string) {
  return text.replace(CODE_SPAN, span => '\uE000'.repeat(span.length))
}

function nonFenced(text: string, out: Segment[]) {
  let last = 0
  for (const m of maskCode(text).matchAll(DISPLAY)) {
    const source = text.slice(m.index, m.index + m[0].length)
    const tex = source.trim().slice(2, -2).trim()
    if (!tex) continue
    proseSegments(text.slice(last, m.index), out)
    last = m.index + m[0].length
    out.push({ kind: 'block', renderer: 'math', body: tex, source })
  }
  proseSegments(text.slice(last), out)
}

export function parse(reply: string): Segment[] {
  // Windows and old Mac line ends, so a blank line is a paragraph break either way.
  const text = reply.replace(/\r\n?/g, '\n')
  const out: Segment[] = []
  const fence = /^([ \t]*)(`{3,}|~{3,})[ \t]*([\w+-]*)[^\n]*\n([\s\S]*?)^\1\2[ \t]*$/gm
  let last = 0
  for (const m of text.matchAll(fence)) {
    nonFenced(text.slice(last, m.index), out)
    last = m.index + m[0].length
    const lang = (m[3] ?? '').toLowerCase()
    const renderer = Object.hasOwn(FENCES, lang) ? FENCES[lang] : undefined
    if (renderer) out.push({ kind: 'block', renderer, body: (m[4] ?? '').replace(/\n$/, ''), source: m[0] })
    else pushMarkdown(out, m[0])
  }
  // A fence still streaming in has no close yet: keep it, and what follows, as source.
  const rest = text.slice(last)
  const open = rest.match(/^[ \t]*(`{3,}|~{3,})/m)
  if (open) {
    nonFenced(rest.slice(0, open.index), out)
    pushMarkdown(out, rest.slice(open.index))
  } else {
    nonFenced(rest, out)
  }
  return out
}

/** Whether anything in `segments` needs rendering. */
export function needsRender(segments: Segment[]) {
  return segments.some(s => s.kind !== 'markdown')
}
