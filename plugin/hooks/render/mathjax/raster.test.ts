import { describe, expect, test } from 'claude-code/testing'

import { polygons, rasterize } from './raster'
import type { SvgNode } from './vendor/mathjax-entry'

const svg = (viewBox: string, ...children: SvgNode[]): SvgNode => ({ tag: 'svg', attrs: { viewBox }, children })
const alphaAt = (r: { width: number; rgba: Uint8Array }, x: number, y: number) => r.rgba[(y * r.width + x) * 4 + 3]!

describe('raster', () => {
  test('a path becomes closed polygons, relative and curved commands included', () => {
    expect(polygons('M0 0L10 0L10 10Z')).toEqual([[[0, 0], [10, 0], [10, 10]]])
    expect(polygons('m0 0h10v10z')).toEqual([[[0, 0], [10, 0], [10, 10]]])
    expect(polygons('M0 0Q5 10 10 0Z')[0]!.length).toBeGreaterThan(5)
  })

  test('a rect fills its pixels opaque and leaves the rest clear', () => {
    // A 1000-unit (1 em) square at 10 px to the em: 10 x 10 pixels, the left half filled.
    const r = rasterize(svg('0 0 1000 1000', { tag: 'rect', attrs: { x: '0', y: '0', width: '500', height: '1000' }, children: [] }), 10, [255, 0, 0])
    expect([r.width, r.height]).toEqual([10, 10])
    expect(alphaAt(r, 2, 5)).toBe(255)
    expect(alphaAt(r, 7, 5)).toBe(0)
    expect(r.ink).toEqual({ top: 0, bottom: 10, left: 0, right: 5 })
  })

  test('an edge through a pixel is anti-aliased', () => {
    const r = rasterize(svg('0 0 1000 1000', { tag: 'rect', attrs: { x: '0', y: '0', width: '550', height: '1000' }, children: [] }), 10, [0, 0, 0])
    expect(alphaAt(r, 5, 5)).toBeGreaterThan(0)
    expect(alphaAt(r, 5, 5)).toBeLessThan(255)
  })

  test('transforms nest, and the baseline is where y = 0 falls', () => {
    const shifted = { tag: 'g', attrs: { transform: 'translate(500, 0)' }, children: [{ tag: 'rect', attrs: { x: '0', y: '0', width: '500', height: '500' }, children: [] }] }
    const r = rasterize(svg('0 -500 1000 1000', shifted), 10, [0, 0, 0])
    expect(r.baseline).toBe(5)
    expect(r.ink).toEqual({ top: 5, bottom: 10, left: 5, right: 10 })
  })
})
