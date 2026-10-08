import { describe, expect, test } from 'claude-code/testing'

import { outlinesOf, rasterize, type Raster } from './raster'
import type { SvgNode } from './vendor/mathjax-entry'

const svg = (viewBox: string, ...children: SvgNode[]): SvgNode => ({ tag: 'svg', attrs: { viewBox }, children })
const rect = (x: number, y: number, width: number, height: number): SvgNode => ({
  tag: 'rect',
  attrs: { x: String(x), y: String(y), width: String(width), height: String(height) },
  children: [],
})
const path = (d: string): SvgNode => ({ tag: 'path', attrs: { d }, children: [] })

// The alpha of the pixel `dx`, `dy` from the ink's top-left corner.
const alphaAt = (r: Raster, dx: number, dy: number) => r.rgba[((r.ink!.top + dy) * r.width + r.ink!.left + dx) * 4 + 3]!
const inkSize = (r: Raster) => [r.ink!.right - r.ink!.left, r.ink!.bottom - r.ink!.top]

describe('outlinesOf', () => {
  test('absolute and relative commands give the same outline', () => {
    const square = [{ start: [0, 0], segments: [[[10, 0]], [[10, 10]]] }]
    expect(outlinesOf('M0 0L10 0L10 10Z')).toEqual(square)
    expect(outlinesOf('m0 0h10v10z')).toEqual(square)
  })

  test('curves keep their control points, smooth ones mirrored', () => {
    expect(outlinesOf('M0 0Q5 10 10 0Z')[0]!.segments).toEqual([[[5, 10], [10, 0]]])
    expect(outlinesOf('M0 0Q5 10 10 0T20 0')[0]!.segments[1]).toEqual([[15, -10], [20, 0]])
  })
})

describe('rasterize', () => {
  // At 10 pixels to the em, a viewBox unit is a hundredth of a pixel.
  test('a rect fills exactly its pixels, opaque, and nothing else', () => {
    const r = rasterize(svg('0 0 1000 1000', rect(0, 0, 500, 1000)), 10, [255, 0, 0])
    expect(inkSize(r)).toEqual([5, 10])
    expect(alphaAt(r, 2, 5)).toBe(255)
    expect([...r.rgba.subarray(((r.ink!.top + 5) * r.width + r.ink!.left + 2) * 4, ((r.ink!.top + 5) * r.width + r.ink!.left + 2) * 4 + 3)]).toEqual([255, 0, 0])
  })

  test('an edge halfway through a pixel covers it half', () => {
    const r = rasterize(svg('0 0 1000 1000', rect(0, 0, 550, 1000)), 10, [0, 0, 0])
    expect(Math.abs(alphaAt(r, 5, 5) - 128)).toBeLessThanOrEqual(1)
  })

  test('an outline wound the other way inside another is a hole; the same way, still filled', () => {
    const outer = 'M0 0H1000V1000H0Z'
    const hole = rasterize(svg('0 0 1000 1000', path(`${outer}M300 300V700H700V300Z`)), 10, [0, 0, 0])
    const doubled = rasterize(svg('0 0 1000 1000', path(`${outer}M300 300H700V700H300Z`)), 10, [0, 0, 0])
    expect(alphaAt(hole, 5, 5)).toBe(0)
    expect(alphaAt(doubled, 5, 5)).toBe(255)
  })

  test('transforms nest, and the baseline is where y = 0 falls', () => {
    const shifted: SvgNode = { tag: 'g', attrs: { transform: 'translate(500, 0)' }, children: [rect(0, 0, 500, 500)] }
    const r = rasterize(svg('0 -500 1000 1000', shifted), 10, [0, 0, 0])
    expect(inkSize(r)).toEqual([5, 5])
    expect(r.ink!.top).toBe(r.baseline)
  })

  test('ink outside the viewBox (an italic overhang) is drawn, not lost', () => {
    const r = rasterize(svg('0 0 1000 1000', rect(-300, 0, 600, 1000)), 10, [0, 0, 0])
    expect(inkSize(r)).toEqual([6, 10])
  })
})
