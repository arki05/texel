import { describe, expect, test } from 'claude-code/testing'

import type { Ink } from '../../layout/geometry'
import type { Rendered, RenderFailure } from '../result'
import { createMathBackend, MAX_BYTES, MathCache, type MathStyle } from './backend'

const style: MathStyle = { grid: { cellWidth: 7.727, cellHeight: 17, xHeight: 7.08, baseline: 0.7727 }, color: 'b3bd5a', inlineScale: 1.2, macros: '' }
const backend = (overrides: Partial<MathStyle> = {}, cache = new MathCache()) => createMathBackend(cache, { ...style, ...overrides })

// The RGBA bytes of a rendered picture.
function pixels(drawn: Rendered | RenderFailure) {
  if ('error' in drawn || 'file' in drawn.picture) throw new Error('expected pixels')
  const { rgba, width, height } = drawn.picture
  return { bytes: Uint8Array.from(atob(rgba), c => c.charCodeAt(0)), width, height }
}

describe('MathJax backend', () => {
  test('a letter has ink above the baseline and next to none below', async () => {
    const ink = (await backend().ink('x')) as Ink
    expect(ink.width).toBeGreaterThan(4)
    expect(ink.above).toBeGreaterThan(5)
    // A hair below, as the glyph and the pixel rows fall: far less than above.
    expect(ink.below).toBeLessThan(ink.above / 8)
  })

  test('a fraction reaches below the baseline too', async () => {
    const ink = (await backend().ink('\\frac{a}{b}')) as Ink
    expect(ink.below).toBeGreaterThan(3)
  })

  test('an inline formula fills the box it was fitted to, in its colour', async () => {
    const drawn = await backend().picture({ kind: 'inline', tex: 'x', placement: { columns: 2, rows: 1, scale: 1, dy: 5 } })
    expect(drawn).toMatchObject({ columns: 2, rows: 1 })
    const { bytes, width, height } = pixels(drawn)
    expect([width, height]).toEqual([Math.floor(2 * 7.727 * 3), 17 * 3])
    const opaque = [...Array(width * height).keys()].find(i => bytes[i * 4 + 3] === 255)!
    expect([...bytes.subarray(opaque * 4, opaque * 4 + 3)]).toEqual([0xb3, 0xbd, 0x5a])
  })

  test('display math is drawn at its own size, in whole cells', async () => {
    const drawn = await backend().picture({ kind: 'display', tex: '\\int_0^1 x\\,dx' })
    expect(drawn).toMatchObject({ rows: expect.any(Number), columns: expect.any(Number) })
    const { width, height } = pixels(drawn)
    const { columns, rows } = drawn as Rendered
    expect([width, height]).toEqual([Math.floor(columns * 7.727 * 3), rows * 17 * 3])
  })

  test('a picture too large for an Image at full resolution has fewer pixels, never over the limit', async () => {
    for (const columns of [60, 97, 128, 181, 255]) {
      for (const rows of [10, 33, 64, 101, 255]) {
        const drawn = await backend().picture({ kind: 'inline', tex: 'x', placement: { columns, rows, scale: 1, dy: 0 } })
        const { width, height } = pixels(drawn)
        expect(width * height * 4).toBeLessThanOrEqual(MAX_BYTES)
      }
    }
  })

  test('a formula too large to show is refused before it is drawn', async () => {
    const huge = 'x\\hspace{1000000em}y'
    expect(await backend().ink(huge)).toMatchObject({ error: expect.stringContaining('too large to show') })
    expect(await backend().picture({ kind: 'display', tex: huge })).toMatchObject({ error: expect.stringContaining('too large to show') })
  })

  test("MathJax's own failure is this formula's alone", async () => {
    const deep = `${'{'.repeat(20000)}x${'}'.repeat(20000)}`
    expect(await backend().ink(deep)).toEqual({ error: expect.stringContaining('MathJax failed:') })
  })

  test('a TeX error, an unknown command among them, is a failure that says why', async () => {
    expect(await backend().ink('\\frac{a}{')).toEqual({ error: 'Missing close brace' })
    expect(await backend().ink('\\foo{x}')).toEqual({ error: 'Undefined control sequence \\foo' })
  })

  test('the macros file defines commands for every formula', async () => {
    const macros = '% personal\n\\newcommand{\\norm}[1]{\\left\\lVert #1 \\right\\rVert}'
    expect(await backend({ macros }).ink('\\norm{x}')).toMatchObject({ width: expect.any(Number) })
    expect(await backend().ink('\\norm{x}')).toMatchObject({ error: expect.stringContaining('\\norm') })
  })

  test('a picture is made once per formula, style and box', async () => {
    const cache = new MathCache()
    const job = { kind: 'display', tex: 'e^{i\\pi}' } as const
    const first = await backend({}, cache).picture(job)
    expect(await backend({}, cache).picture(job)).toBe(first)
    expect(await backend({ color: 'ffffff' }, cache).picture(job)).not.toBe(first)
  })
})
