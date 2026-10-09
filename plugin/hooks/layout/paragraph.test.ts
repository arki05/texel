import { describe, expect, test } from 'claude-code/testing'

import type { Answers } from '../render/renderer'
import { DEFAULT_FIT } from './fit'
import type { Ink } from './geometry'
import { layoutParagraph } from './paragraph'

const grid = { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 }

// Answers that know each formula's ink, and draw any placement as asked.
const answers = (inks: Record<string, Ink>): Answers<undefined> => ({
  ink: async tex => inks[tex] ?? { error: 'unknown' },
  picture: async job => ({ picture: { rgba: '', width: 1, height: 1 }, columns: job.kind === 'inline' ? job.placement.columns : 1, rows: 1 }),
})

const texts = (laid: Awaited<ReturnType<typeof layoutParagraph>>) =>
  laid!.flatMap(line => line.rows.flatMap(row => row.pieces.map(piece => (piece.kind === 'text' ? piece.text : `[${piece.box.tex}]`))))

describe('layoutParagraph', () => {
  const line = (tex: string) => [{ prefix: '', indent: 0, heading: false, atoms: [{ kind: 'text', text: 'see ' } as const, { kind: 'math', tex } as const] }]

  test('a formula that fits the line is drawn', async () => {
    const laid = await layoutParagraph(answers({ x: { width: 8, above: 7.9, below: 0.2 } }), line('x'), { grid, fit: DEFAULT_FIT, columns: 40 })
    expect(texts(laid)).toContain('[x]')
  })

  test('one that would have to shrink past half its size shows its source instead', async () => {
    const wide = { width: 40 * 7.8 * 2.5, above: 7.9, below: 0.2 }
    const laid = await layoutParagraph(answers({ long: wide }), line('long'), { grid, fit: DEFAULT_FIT, columns: 40 })
    expect(texts(laid)).toEqual(['see \\(long\\)', ' (too large for the line)'])
  })
})
