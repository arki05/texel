import { describe, expect, test } from 'claude-code/testing'

import type { Ink } from '../../layout/geometry'
import { decodePng } from '../png'
import type { Rendered, RenderFailure } from '../result'
import { createMathBackend, MathCache, type MathStyle } from './backend'

const style: MathStyle = { grid: { cellWidth: 7.727, cellHeight: 17, xHeight: 7.08, baseline: 0.7727 }, color: 'b3bd5a', inlineScale: 1.2, macros: '' }
const backend = (overrides: Partial<MathStyle> = {}, cache = new MathCache()) => createMathBackend(cache, { ...style, ...overrides })

// The RGBA bytes of a rendered picture.
function pixels(drawn: Rendered | RenderFailure) {
  if ('error' in drawn || 'file' in drawn.picture) throw new Error('expected a PNG')
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
    const drawn = await backend().picture({ kind: 'inline', tex: 'x', placement: { columns: 2, rows: 1, scale: 1, dy: 5 } })
    expect(drawn).toMatchObject({ columns: 2, rows: 1 })
    const { bytes, width, height } = pixels(drawn)
    expect([width, height]).toEqual([Math.round(2 * 7.727 * 3), 17 * 3])
    const opaque = [...Array(width * height).keys()].find(i => bytes[i * 4 + 3] === 255)!
    expect([...bytes.subarray(opaque * 4, opaque * 4 + 3)]).toEqual([0xb3, 0xbd, 0x5a])
  })

  test('display math is drawn at its own size, in whole cells', async () => {
    const drawn = await backend().picture({ kind: 'display', tex: '\\int_0^1 x\\,dx' })
    expect(drawn).toMatchObject({ rows: expect.any(Number), columns: expect.any(Number) })
    const { width, height } = pixels(drawn)
    const { columns, rows } = drawn as Rendered
    expect([width, height]).toEqual([Math.round(columns * 7.727 * 3), rows * 17 * 3])
  })

  test('a picture is a PNG, small: a display formula is a few kilobytes, not its raw pixels', async () => {
    const drawn = await backend().picture({ kind: 'display', tex: '\\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}' })
    const { width, height } = pixels(drawn)
    const { png } = (drawn as Rendered).picture as { png: string }
    expect(png.length).toBeLessThan((width * height * 4) / 10)
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
    const draw = (tex: string) => math.picture({ kind: 'display', tex })
    const first = await draw('a')
    for (const tex of ['b', 'c', 'd', 'e', 'f', 'g', 'h']) await draw(tex)
    expect(cache.size).toBeLessThan(8)
    expect(await draw('a')).not.toBe(first)
    const again = await draw('h')
    expect(await draw('h')).toBe(again)
    backend({ macros: '\\newcommand{\\x}{y}' }, cache)
    expect(cache.size).toBe(0)
  })

  test('a picture is made once per formula, style and box', async () => {
    const cache = new MathCache()
    const job = { kind: 'display', tex: 'e^{i\\pi}' } as const
    const first = await backend({}, cache).picture(job)
    expect(await backend({}, cache).picture(job)).toBe(first)
    expect(await backend({ color: 'ffffff' }, cache).picture(job)).not.toBe(first)
  })
})
