import { describe, expect, test } from 'claude-code/testing'

import { MESSAGE_PICTURE_BYTES } from '../geometry'
import type { Segment } from '../markdown/parse'
import type { BlockRenderer, Renderers } from '../render/renderer'
import { DEFAULT_FIT } from './fit'
import { layoutMessage } from './message'

const grid = { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 13.14 }
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
      empty: { error: 'error: panicked with: "the block draws nothing"\n  ┌─ texel.typ' },
    }
    const laid = await layoutMessage(renderers(async body => answers[body]), Object.keys(answers).map(block), options)
    expect(laid.map(part => (part.kind === 'source' ? part.note ?? 'source' : part.kind))).toEqual([
      'picture',
      'source',
      'render failed: unknown variable',
      'not rendered: needs typst 0.15 or newer',
      'render failed: the block draws nothing',
    ])
  })

  test('pictures past what one message can hold show their source, in reading order', async () => {
    const big = Math.floor(MESSAGE_PICTURE_BYTES * 0.4)
    const laid = await layoutMessage(renderers(async () => picture(big)), ['a', 'b', 'c', 'd'].map(block), options)
    expect(laid.map(part => part.kind)).toEqual(['picture', 'picture', 'source', 'source'])
    expect(laid[2]).toMatchObject({ source: '```typst\nc\n```', note: expect.stringContaining('more pictures than one message can hold') })
  })

  test("a block's view: its zoom goes to its renderer, its source shown asks nothing, and both carry its handle", async () => {
    const asked: (number | undefined)[] = []
    const draw: BlockRenderer = async (_body, _columns, zoom) => (asked.push(zoom), picture(10))
    const views = new Map([
      [0, { key: 'a', zoom: 1.5, source: false }],
      [1, { key: 'b', zoom: 1, source: true }],
    ])
    const laid = await layoutMessage(renderers(draw), [block('x'), block('y'), block('z')], options, views)
    expect(asked).toEqual([1.5, 1])
    expect(laid[0]).toMatchObject({ kind: 'picture', block: { key: 'a', zoom: 1.5, body: 'x', zoomable: true } })
    expect(laid[1]).toMatchObject({ kind: 'source', source: '```typst\ny\n```', block: { key: 'b', source: true } })
    expect(laid[2]).toMatchObject({ kind: 'picture' })
    expect(laid[2]).not.toHaveProperty('block.key')
  })

  test('a block keeps its handle while its picture is on its way, and past the budget', async () => {
    const views = new Map([[0, { key: 'a', zoom: 2, source: false }], [1, { key: 'b', zoom: 1, source: false }], [2, { key: 'c', zoom: 1, source: false }]])
    const big = Math.floor(MESSAGE_PICTURE_BYTES * 0.6)
    const answers: Record<string, Awaited<ReturnType<BlockRenderer>>> = { waiting: undefined, first: picture(big), second: picture(big) }
    const laid = await layoutMessage(renderers(async body => answers[body]), ['waiting', 'first', 'second'].map(block), options, views)
    expect(laid.map(part => part.kind)).toEqual(['source', 'picture', 'source'])
    expect(laid[0]).toMatchObject({ block: { key: 'a', zoom: 2 } })
    expect(laid[2]).toMatchObject({ note: expect.stringContaining('more pictures'), block: { key: 'c', body: 'second' } })
  })
})
