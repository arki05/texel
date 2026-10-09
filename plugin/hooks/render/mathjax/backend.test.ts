import { describe, expect, test } from 'claude-code/testing'

import type { Ink } from '../../geometry'
import { decodePng } from '../png'
import type { Rendered, RenderFailure } from '../result'
import { createMathBackend, MathCache, type MathStyle } from './backend'

const style: MathStyle = { grid: { cellWidth: 7.727, cellHeight: 17, xHeight: 7.08, baseline: 13.136 }, color: 'b3bd5a', inlineSize: 1.2, macros: '' }
const backend = (overrides: Partial<MathStyle> = {}, cache = new MathCache()) => createMathBackend(cache, { ...style, ...overrides })

// The RGBA bytes of a rendered picture.
function pixels(drawn: Rendered | RenderFailure | undefined) {
  if (!drawn || 'error' in drawn || 'file' in drawn.picture) throw new Error('expected a PNG')
  const { rgba, width, height } = decodePng(Uint8Array.from(atob(drawn.picture.png), c => c.charCodeAt(0)))
  return { bytes: rgba, width, height }
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
    const drawn = await backend().picture('x', { columns: 2, rows: 1, scale: 1, dy: 5 })
    expect(drawn).toMatchObject({ columns: 2, rows: 1 })
    const { bytes, width, height } = pixels(drawn)
    expect([width, height]).toEqual([Math.round(2 * 7.727 * 3), 17 * 3])
    const opaque = [...Array(width * height).keys()].find(i => bytes[i * 4 + 3] === 255)!
    expect([...bytes.subarray(opaque * 4, opaque * 4 + 3)]).toEqual([0xb3, 0xbd, 0x5a])
  })

  test("an inline formula's ink keeps to the side it is placed against", async () => {
    const at = async (side?: 'left' | 'right') => {
      const { bytes, width } = pixels(await backend().picture('x', { columns: 3, rows: 1, scale: 1, dy: 5, side }))
      const inked = [...Array(bytes.length / 4).keys()].filter(i => bytes[i * 4 + 3]! > 8).map(i => i % width)
      return [Math.min(...inked), width - 1 - Math.max(...inked)] as const
    }
    expect((await at('left'))[0]).toBe(0)
    expect((await at('right'))[1]).toBe(0)
    const [left, right] = await at()
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1)
  })

  test('display math is drawn at its own size, in whole cells', async () => {
    const drawn = await backend().block('\\int_0^1 x\\,dx', 120)
    expect(drawn).toMatchObject({ rows: expect.any(Number), columns: expect.any(Number) })
    const { width, height } = pixels(drawn)
    const { columns, rows } = drawn as Rendered
    expect([width, height]).toEqual([Math.round(columns * 7.727 * 3), rows * 17 * 3])
  })

  test('display math too wide for its width shrinks to fit it, down to half its size', async () => {
    const wide = '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2} \\quad \\int_0^1 x^2 \\, dx = \\frac{1}{3} \\quad e^{i\\pi} + 1 = 0'
    const natural = (await backend().block(wide, 200)) as Rendered
    const fitted = (await backend().block(wide, natural.columns - 6)) as Rendered
    expect(fitted.columns).toBeLessThanOrEqual(natural.columns - 6)
    expect(fitted.rows).toBeLessThanOrEqual(natural.rows)
    expect(await backend().block(wide, Math.floor(natural.columns / 3))).toEqual({ error: expect.stringContaining('too wide') })
  })

  test('a picture is a PNG, small: a display formula is a few kilobytes, not its raw pixels', async () => {
    const drawn = await backend().block('\\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}', 120)
    const { width, height } = pixels(drawn)
    const { png } = (drawn as Rendered).picture as { png: string }
    expect(png.length).toBeLessThan((width * height * 4) / 10)
  })

  test('a formula too large to show is refused before it is drawn', async () => {
    const huge = 'x\\hspace{1000000em}y'
    expect(await backend().ink(huge)).toMatchObject({ error: expect.stringContaining('too large to show') })
    expect(await backend().block(huge, 120)).toMatchObject({ error: expect.stringContaining('too large to show') })
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

  test("what one formula defines never reaches the next; the macros file's reach every one", async () => {
    const math = backend({ macros: '\\newcommand{\\R}{\\mathbb{R}}' })
    expect(await math.ink('\\newcommand{\\Z}{\\mathbb{Z}} \\Z \\subset \\R')).toMatchObject({ width: expect.any(Number) })
    expect(await math.ink('\\Z')).toEqual({ error: 'Undefined control sequence \\Z' })
    expect(await math.ink('\\R')).toMatchObject({ width: expect.any(Number) })
  })

  test('broken macros fail every formula, saying where', async () => {
    expect(await backend({ macros: '\\newcommand{\\bad}{\\frac{1}' }).ink('x')).toMatchObject({ error: expect.stringContaining('in your macros:') })
  })

  test('the cache lets the least recently used go past its size, and starts afresh for new macros', async () => {
    const cache = new MathCache(3)
    const math = backend({}, cache)
    const draw = (tex: string) => math.block(tex, 120)
    const first = await draw('a')
    for (const tex of ['b', 'c', 'd', 'e', 'f', 'g', 'h']) await draw(tex)
    expect(cache.results.count()).toBeLessThan(8)
    expect(await draw('a')).not.toBe(first)
    const again = await draw('h')
    expect(await draw('h')).toBe(again)
    backend({ macros: '\\newcommand{\\x}{y}' }, cache)
    expect(cache.results.count()).toBe(0)
  })

  test('a formula is converted once, measured or drawn, at any size or colour', async () => {
    const cache = new MathCache()
    await backend({}, cache).ink('\\sqrt{2}')
    await backend({}, cache).picture('\\sqrt{2}', { columns: 2, rows: 1, scale: 0.8, dy: 2 })
    await backend({ color: 'ffffff' }, cache).ink('\\sqrt{2}')
    expect(cache.drawings.count()).toBe(1)
  })

  test('a picture is made once per formula, style and box', async () => {
    const cache = new MathCache()
    const first = await backend({}, cache).block('e^{i\\pi}', 120)
    expect(await backend({}, cache).block('e^{i\\pi}', 80)).toBe(first)
    expect(await backend({ color: 'ffffff' }, cache).block('e^{i\\pi}', 120)).not.toBe(first)
  })
})
