// Breaks a line of prose and inline formulas into terminal lines, so each
// line knows which formulas it holds, and so how many rows it must grow above
// and below its text to hold them. Pure: pieces and a width in, lines out.

import type { TextStyle } from '../markdown/parse'

export type Piece<Box> =
  /** Text, `dim` for texel's own notes. */
  | ({ kind: 'text'; text: string; dim?: boolean } & TextStyle)
  /** A formula: `columns` wide, with `above`/`below` rows beyond the text's. */
  | { kind: 'box'; columns: number; above: number; below: number; box: Box }

export type Line<Box> = {
  pieces: Piece<Box>[]
  /** Rows the line grows above and below its text: its tallest formula's. */
  above: number
  below: number
}

// Most of East Asian scripts and emoji take two cells.
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦\u{1f300}-\u{1faff}\u{20000}-\u{3fffd}]/u

/** How many terminal cells `text` covers. */
export function textColumns(text: string) {
  let n = 0
  for (const char of text) n += WIDE.test(char) ? 2 : 1
  return n
}

type Token<Box> = { piece: Piece<Box>; width: number; space: number }

// Text into words, each carrying the spaces after it (`space` cells), which
// may hang past the line's end.
function tokens<Box>(pieces: Piece<Box>[]): Token<Box>[] {
  return pieces.flatMap((piece): Token<Box>[] => {
    if (piece.kind === 'box') return [{ piece, width: piece.columns, space: 0 }]
    return piece.text.split(/(?<=\s)(?=\S)/).map(word => {
      const text = word.replace(/\s+/g, ' ')
      const bare = text.trimEnd()
      return { piece: { ...piece, text }, width: textColumns(bare), space: text.length - bare.length }
    })
  })
}

// A word wider than a whole line, cut into pieces that each fit one.
function cut<Box>(token: Token<Box>, width: number): Token<Box>[] {
  if (token.piece.kind !== 'text' || token.width <= width) return [token]
  const parts: Token<Box>[] = []
  let part = ''
  for (const char of token.piece.text) {
    if (textColumns(part + char) > width) {
      parts.push({ piece: { ...token.piece, text: part }, width: textColumns(part), space: 0 })
      part = ''
    }
    part += char
  }
  return [...parts, { piece: { ...token.piece, text: part }, width: textColumns(part.trimEnd()), space: 0 }]
}

// Neighbouring words of one style become one piece.
function merge<Box>(pieces: Piece<Box>[]): Piece<Box>[] {
  const out: Piece<Box>[] = []
  for (const piece of pieces) {
    const prev = out[out.length - 1]
    if (
      prev?.kind === 'text' &&
      piece.kind === 'text' &&
      prev.bold === piece.bold &&
      prev.italic === piece.italic &&
      prev.code === piece.code &&
      prev.dim === piece.dim
    ) {
      out[out.length - 1] = { ...prev, text: prev.text + piece.text }
    } else {
      out.push(piece)
    }
  }
  return out
}

// Tokens with no space between them (a formula and the comma after it, a
// word changing style mid-way) wrap as one unit. A unit wider than a line
// wraps token by token, a word wider than a line cut to fit.
function units<Box>(all: Token<Box>[], width: number): Token<Box>[][] {
  const grouped: Token<Box>[][] = []
  for (const token of all) {
    const last = grouped[grouped.length - 1]
    if (last && last[last.length - 1]!.space === 0) last.push(token)
    else grouped.push([token])
  }
  return grouped.flatMap(unit => (span(unit) <= width ? [unit] : unit.flatMap(token => cut(token, width).map(part => [part]))))
}

// A unit's width, its last token's trailing space aside.
function span<Box>(unit: Token<Box>[]) {
  return unit.reduce((sum, token, i) => sum + token.width + (i < unit.length - 1 ? token.space : 0), 0)
}

/** Greedy wrapping at `width` cells; a formula is never split, only moved down with what touches it. */
export function wrap<Box>(pieces: Piece<Box>[], width: number): Line<Box>[] {
  const lines: Piece<Box>[][] = [[]]
  let used = 0
  for (const unit of units(tokens(pieces), width)) {
    if (used > 0 && used + span(unit) > width) {
      lines.push([])
      used = 0
    }
    for (const token of unit) {
      // A space that would open a line is dropped.
      if (used === 0 && token.piece.kind === 'text' && !token.piece.text.trim()) continue
      lines[lines.length - 1]!.push(token.piece)
      used += token.width + token.space
    }
  }
  return lines
    .filter(line => line.length > 0)
    .map(line => ({
      pieces: merge(line),
      above: Math.max(0, ...line.map(p => (p.kind === 'box' ? p.above : 0))),
      below: Math.max(0, ...line.map(p => (p.kind === 'box' ? p.below : 0))),
    }))
}
