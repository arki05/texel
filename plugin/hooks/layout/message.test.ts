import { describe, expect, test } from 'claude-code/testing'

import { MESSAGE_PICTURE_BYTES } from '../geometry'
import type { Segment } from '../markdown/parse'
import type { BlockRenderer, Renderers } from '../render/renderer'
import { DEFAULT_FIT } from './fit'
import { layoutMessage } from './message'

const grid = { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 }
const options = { grid, fit: DEFAULT_FIT, columns: 80 }
const picture = (bytes: number) => ({ picture: { png: 'x'.repeat(bytes) }, columns: 4, rows: 2 })

// Renderers whose blocks answer as `block` says; inline math is not asked here.
const renderers = (block: BlockRenderer): Renderers => ({
  inline: { ink: async () => ({ error: 'unused' }), picture: async () => ({ error: 'unused' }) },
  blocks: { math: block, typst: block },
})
const block = (body: string): Segment => ({ kind: 'block', renderer: 'typst', body, source: `\`\`\`typst\n${body}\n\`\`\`` })

describe('layoutMessage', () => {
  test('a block is its picture; not ready, its source; failed or skipped, its source and why', async () => {
    const answers: Record<string, Awaited<ReturnType<BlockRenderer>>> = {
      drawn: picture(10),
      waiting: undefined,
      broken: { error: 'error: unknown variable' },
      off: { error: 'needs typst 0.15 or newer', skipped: true },
    }
    const laid = await layoutMessage(renderers(async body => answers[body]), Object.keys(answers).map(block), options)
    expect(laid.map(part => (part.kind === 'source' ? part.note ?? 'source' : part.kind))).toEqual([
      'picture',
      'source',
      'render failed: unknown variable',
      'not rendered: needs typst 0.15 or newer',
    ])
  })

  test('pictures past what one message can hold show their source, in reading order', async () => {
    const big = Math.floor(MESSAGE_PICTURE_BYTES * 0.4)
    const laid = await layoutMessage(renderers(async () => picture(big)), ['a', 'b', 'c', 'd'].map(block), options)
    expect(laid.map(part => part.kind)).toEqual(['picture', 'picture', 'source', 'source'])
    expect(laid[2]).toMatchObject({ source: '```typst\nc\n```', note: expect.stringContaining('more pictures than one message can hold') })
  })
})
