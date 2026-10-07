// Splits an assistant reply's markdown into what the engine can draw as-is and
// what the render pipeline should turn into pictures. Pure: no `$`, no I/O.

export type Atom =
  | { kind: 'text'; text: string; bold?: boolean; italic?: boolean; code?: boolean }
  /** `display`: it asks for display style (`\displaystyle`, `\dfrac`), so needs room. */
  | { kind: 'math'; tex: string; display: boolean }

export type InlineLine = {
  /** What leads the line: a list marker, a quote bar, or nothing. */
  prefix: string
  indent: number
  heading: boolean
  atoms: Atom[]
}

export type Segment =
  | { kind: 'markdown'; text: string }
  | { kind: 'display'; tex: string; source: string }
  | { kind: 'typst'; code: string; source: string }
  | { kind: 'paragraph'; lines: InlineLine[]; source: string }

const MATH_FENCES = new Set(['latex', 'tex', 'math', 'katex'])
const TYPST_FENCES = new Set(['typst', 'typ'])

// `$…$` follows pandoc's rule: no space just inside either dollar, and no digit
// right after the closing one, so "$5 and $10" stays prose; `\$` is a dollar.
const INLINE_DOLLAR = String.raw`(?<![\\$\w])\$(?=[^\s$])((?:\\\$|[^$\n])+?)(?<=[^\s\\])\$(?![\d$])`
const INLINE_PAREN = String.raw`\\\((.+?)\\\)`
const HAS_INLINE = new RegExp(`${INLINE_DOLLAR}|${INLINE_PAREN}`)
// Display math is always a block of its own, as in LaTeX: mid-sentence it splits
// the paragraph. It never crosses a blank line, so one stray `$$` cannot swallow
// the prose up to the next formula.
const NO_BREAK = String.raw`(?:(?!\n[ \t]*\n)[\s\S])`
const DISPLAY = new RegExp(String.raw`(?<!\\)\$\$${NO_BREAK}+?\$\$|\\\[${NO_BREAK}+?\\\]`, 'g')

// A code span, like display math, ends at a paragraph break.
const CODE_SPAN = new RegExp(String.raw`(\x60+)([^\x60]${NO_BREAK}*?)\1(?!\x60)`, 'g')

const TOKEN = new RegExp(
  [
    INLINE_PAREN, // 1
    INLINE_DOLLAR, // 2
    String.raw`\*\*(.+?)\*\*`, // 3 bold
    String.raw`__(.+?)__`, // 4 bold
    String.raw`(?<![\w*])\*(?![\s*])(.+?)(?<!\s)\*(?![\w*])`, // 5 italic
    String.raw`(?<![\w_])_(?![\s_])(.+?)(?<!\s)_(?![\w_])`, // 6 italic
    String.raw`\[([^\]]+)\]\([^)]+\)`, // 7 link text
  ].join('|'),
  'g',
)

type Style = { bold?: boolean; italic?: boolean }

const DISPLAY_STYLE = /\\(?:displaystyle|dfrac)\b/

function math(tex: string): Atom {
  return { kind: 'math', tex: tex.trim(), display: DISPLAY_STYLE.test(tex) }
}

function tokenizeProse(text: string, style: Style): Atom[] {
  const atoms: Atom[] = []
  const pushText = (t: string) => {
    if (t) atoms.push({ kind: 'text', text: t.replace(/\\\$/g, '$'), ...style })
  }
  let last = 0
  for (const m of text.matchAll(TOKEN)) {
    pushText(text.slice(last, m.index))
    last = m.index + m[0].length
    if (m[1] !== undefined || m[2] !== undefined) atoms.push(math((m[1] ?? m[2])!))
    else if (m[3] !== undefined || m[4] !== undefined) atoms.push(...tokenizeProse((m[3] ?? m[4])!, { ...style, bold: true }))
    else if (m[5] !== undefined || m[6] !== undefined) atoms.push(...tokenizeProse((m[5] ?? m[6])!, { ...style, italic: true }))
    else if (m[7] !== undefined) atoms.push(...tokenizeProse(m[7], style))
  }
  pushText(text.slice(last))
  return atoms
}

// Code spans first, so nothing inside one is ever math or emphasis.
export function tokenize(text: string, style: Style = {}): Atom[] {
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

// Tables and indented code keep the engine's drawing; math in them stays source.
function isLayoutable(paragraph: string) {
  return !paragraph.split('\n').some(line => /^\s*\|/.test(line) || /^( {4}|\t)/.test(line))
}

function paragraphLines(paragraph: string): InlineLine[] {
  const lines: { prefix: string; indent: number; heading: boolean; text: string }[] = []
  for (const raw of paragraph.split('\n')) {
    const heading = raw.match(/^#{1,6}\s+(.*)$/)
    const item = raw.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
    const quote = raw.match(/^>\s?(.*)$/)
    if (heading) lines.push({ prefix: '', indent: 0, heading: true, text: heading[1]! })
    else if (item) {
      const [, indent = '', bullet = '', rest = ''] = item
      const marker = /\d/.test(bullet) ? `${bullet} ` : '• '
      lines.push({ prefix: marker, indent: indent.length, heading: false, text: rest })
    } else if (quote) lines.push({ prefix: '│ ', indent: 0, heading: false, text: quote[1] ?? '' })
    else if (lines.length && raw.trim()) lines[lines.length - 1]!.text += ` ${raw.trim()}`
    else if (raw.trim()) lines.push({ prefix: '', indent: 0, heading: false, text: raw.trim() })
  }
  return lines.map(({ text, ...rest }) => ({ ...rest, atoms: tokenize(text, rest.heading ? { bold: true } : {}) }))
}

function proseSegments(text: string, out: Segment[]) {
  for (const paragraph of text.split(/\n[ \t]*\n/)) {
    if (!paragraph.trim()) continue
    if (hasInlineMath(paragraph) && isLayoutable(paragraph)) {
      out.push({ kind: 'paragraph', lines: paragraphLines(paragraph), source: paragraph })
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
    out.push({ kind: 'display', tex, source })
  }
  proseSegments(text.slice(last), out)
}

export function parse(text: string): Segment[] {
  const out: Segment[] = []
  const fence = /^([ \t]*)(`{3,}|~{3,})[ \t]*([\w+-]*)[^\n]*\n([\s\S]*?)^\1\2[ \t]*$/gm
  let last = 0
  for (const m of text.matchAll(fence)) {
    nonFenced(text.slice(last, m.index), out)
    last = m.index + m[0].length
    const lang = (m[3] ?? '').toLowerCase()
    const body = (m[4] ?? '').replace(/\n$/, '')
    if (MATH_FENCES.has(lang) && !/\\documentclass|\\begin\{tikzpicture\}/.test(body)) {
      out.push({ kind: 'display', tex: body, source: m[0] })
    } else if (TYPST_FENCES.has(lang)) {
      out.push({ kind: 'typst', code: body, source: m[0] })
    } else {
      pushMarkdown(out, m[0])
    }
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

/** Whether anything in `segments` needs the pipeline. */
export function needsRender(segments: Segment[]) {
  return segments.some(s => s.kind !== 'markdown')
}
