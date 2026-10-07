import { describe, expect, test } from 'claude-code/testing'

import { program, widthFree, type Style } from './typst'

const style: Style = {
  grid: { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 },
  mathColor: 'b3bd5a',
  typstColor: 'e6e6e6',
  inlineScale: 1.2,
  macros: '\\newcommand{\\N}{\\mathbb{N}}',
}
const placement = { columns: 3, rows: 1, scale: 1, dy: 5 }
const block = (maxColumns: number) => ({ kind: 'typst', typst: 'hi', maxColumns }) as const

describe('program', () => {
  test('LaTeX travels as inputs, never in the source', () => {
    const { source, inputs } = program({ kind: 'inline', tex: '"}\\x', placement }, style)
    expect(source).not.toContain('\\x')
    expect([inputs.tex, inputs.macros]).toEqual(['"}\\x', style.macros])
  })

  test('each job calls the texel.typ entry point of its kind', () => {
    expect(program({ kind: 'ink', tex: 'x' }, style).source).toContain('#inline-ink()')
    expect(program({ kind: 'inline', tex: 'x', placement }, style).source).toContain('#inline-math()')
    expect(program({ kind: 'display', tex: 'x' }, style).source).toContain('#display-math()')
    expect(program(block(80), style).source).toContain('#typst-block[\nhi\n]')
  })

  test('only a typst block depends on the width; width-free, its programs agree', () => {
    expect(program(block(40), style)).not.toEqual(program(block(120), style))
    expect(widthFree(program(block(40), style))).toEqual(widthFree(program(block(120), style)))
    expect(program({ kind: 'display', tex: 'x' }, style).inputs['max-columns']).toBe(undefined)
  })

  test('measuring is colourless; math and blocks take their own colours', () => {
    expect(program({ kind: 'ink', tex: 'x' }, style).inputs.foreground).toBe(undefined)
    expect(program({ kind: 'display', tex: 'x' }, style).inputs.foreground).toBe('b3bd5a')
    expect(program(block(80), style).inputs.foreground).toBe('e6e6e6')
  })

  test('inline math is set at its own scale, everything else at the text size', () => {
    expect(program({ kind: 'inline', tex: 'x', placement }, style).inputs.scale).toBe('1.2')
    expect(program({ kind: 'display', tex: 'x' }, style).inputs.scale).toBe('1')
  })
})
