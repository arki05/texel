// Breaks a line of prose and inline formulas into terminal lines, so each
// line knows which formulas it holds, and so how many rows it must grow above
// and below its text to hold them. Pure: pieces and a width in, lines out.

export type TextStyle = { bold?: boolean; italic?: boolean; code?: boolean; dim?: boolean }

export type Piece<Box> =
  | ({ kind: 'text'; text: string } & TextStyle)
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
export function cells(text: string) {
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
      return { piece: { ...piece, text }, width: cells(bare), space: text.length - bare.length }
    })
  })
}

// A word wider than a whole line, cut into pieces that each fit one.
function cut<Box>(token: Token<Box>, width: number): Token<Box>[] {
  if (token.piece.kind !== 'text' || token.width <= width) return [token]
  const parts: Token<Box>[] = []
  let part = ''
  for (const char of token.piece.text) {
    if (cells(part + char) > width) {
      parts.push({ piece: { ...token.piece, text: part }, width: cells(part), space: 0 })
      part = ''
    }
    part += char
  }
  return [...parts, { piece: { ...token.piece, text: part }, width: cells(part.trimEnd()), space: 0 }]
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

/** Greedy wrapping at `width` cells; a formula is never split, only moved down. */
export function wrap<Box>(pieces: Piece<Box>[], width: number): Line<Box>[] {
  const lines: Piece<Box>[][] = [[]]
  let used = 0
  for (const token of tokens(pieces).flatMap(t => cut(t, width))) {
    if (used > 0 && used + token.width > width) {
      lines.push([])
      used = 0
    }
    // A space that would open a line is dropped.
    if (used === 0 && token.piece.kind === 'text' && !token.piece.text.trim()) continue
    lines[lines.length - 1]!.push(token.piece)
    used += token.width + token.space
  }
  return lines
    .filter(line => line.length > 0)
    .map(line => ({
      pieces: merge(line),
      above: Math.max(0, ...line.map(p => (p.kind === 'box' ? p.above : 0))),
      below: Math.max(0, ...line.map(p => (p.kind === 'box' ? p.below : 0))),
    }))
}
