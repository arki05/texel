import { describe, expect, test } from 'claude-code/testing'

import { compileCommand, measureCommand, program, widthFree, type Style } from './typst'

const style: Style = {
  grid: { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 },
  mathColor: 'b3bd5a',
  typstColor: 'e6e6e6',
  inlineScale: 1.2,
  macros: '\\newcommand{\\N}{\\mathbb{N}}',
}
const placement = { columns: 3, rows: 1, scale: 1, dy: 5 }

describe('program', () => {
  test('LaTeX travels as inputs, never in the source', () => {
    const { source, inputs } = program({ kind: 'inline', tex: '"}\\x', placement }, style, 80)
    expect(source).not.toContain('\\x')
    expect([inputs.tex, inputs.macros]).toEqual(['"}\\x', style.macros])
  })

  test('only a typst block depends on the width', () => {
    for (const job of [{ kind: 'ink', tex: 'x' }, { kind: 'inline', tex: 'x', placement }, { kind: 'display', tex: 'x' }] as const) {
      expect(program(job, style, 40)).toEqual(program(job, style, 120))
    }
    expect(program({ kind: 'block', typst: 'hi' }, style, 40)).not.toEqual(program({ kind: 'block', typst: 'hi' }, style, 120))
    expect(widthFree(program({ kind: 'block', typst: 'hi' }, style, 40))).toEqual(widthFree(program({ kind: 'block', typst: 'hi' }, style, 120)))
  })

  test('measuring is colourless; math and blocks take their own colours', () => {
    expect(program({ kind: 'ink', tex: 'x' }, style, 80).inputs.foreground).toBe(undefined)
    expect(program({ kind: 'display', tex: 'x' }, style, 80).inputs.foreground).toBe('b3bd5a')
    expect(program({ kind: 'block', typst: 'x' }, style, 80).inputs.foreground).toBe('e6e6e6')
  })

  test('inline math is set at its own scale, everything else at the text size', () => {
    expect(program({ kind: 'inline', tex: 'x', placement }, style, 80).inputs.scale).toBe('1.2')
    expect(program({ kind: 'display', tex: 'x' }, style, 80).inputs.scale).toBe('1')
  })
})

describe('commands', () => {
  const ink = program({ kind: 'ink', tex: 'x' }, style, 80)

  test('compile reads the source from stdin under the library root', () => {
    expect(compileCommand('/lib', ink, '/out.png')).toEqual(expect.arrayContaining(['typst', 'compile', '--root', '/lib', 'tex=x', '-', '/out.png']))
  })

  test('measure reads the ink back from its label', () => {
    expect(measureCommand('/lib', ink).slice(-3)).toEqual(['--in', '-', 'query(<ink>).first().value'])
  })
})
