import { describe, expect, test } from 'claude-code/testing'

import { cells, wrap, type Piece } from './wrap'

const text = (t: string): Piece<string> => ({ kind: 'text', text: t })
const box = (columns: number, above = 0, below = 0): Piece<string> => ({ kind: 'box', columns, above, below, box: 'f' })
const shown = (lines: ReturnType<typeof wrap<string>>) =>
  lines.map(line => line.pieces.map(p => (p.kind === 'text' ? p.text : `[${p.columns}]`)).join(''))

describe('wrap', () => {
  test('words wrap at the width, trailing spaces hanging', () => {
    expect(shown(wrap([text('one two three four')], 9))).toEqual(['one two ', 'three ', 'four'])
  })

  test('a formula moves whole to the next line', () => {
    expect(shown(wrap([text('area is '), box(6), text(', fine')], 12))).toEqual(['area is ', '[6], fine'])
  })

  test('punctuation stays glued to the formula before it', () => {
    expect(shown(wrap([text('so '), box(3), text(', and')], 20))).toEqual(['so [3], and'])
  })

  test('punctuation wraps with its formula, never alone', () => {
    expect(shown(wrap([text('aaaa bbbb '), box(3), text('.')], 13))).toEqual(['aaaa bbbb ', '[3].'])
  })

  test("each line takes its tallest formula's rows", () => {
    const lines = wrap([text('a '), box(2, 1, 0), text(' b c d e f g '), box(2, 0, 1), box(2, 1, 1)], 8)
    expect(lines.map(l => [l.above, l.below])).toEqual([
      [1, 0],
      [0, 0],
      [1, 1],
    ])
  })

  test('a word wider than the line is cut', () => {
    expect(shown(wrap([text('abcdefghij')], 4))).toEqual(['abcd', 'efgh', 'ij'])
  })

  test('wide characters take two cells', () => {
    expect(cells('日本')).toBe(4)
    expect(cells('ab')).toBe(2)
  })

  test('styles survive and neighbours of one style merge', () => {
    const [line] = wrap([text('plain '), { kind: 'text', text: 'bold words', bold: true }], 40)
    expect(line?.pieces).toEqual([
      { kind: 'text', text: 'plain ' },
      { kind: 'text', text: 'bold words', bold: true },
    ])
  })
})
