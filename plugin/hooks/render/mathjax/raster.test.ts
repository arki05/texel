import { describe, expect, test } from 'claude-code/testing'

import { rasterize, type Box, type Outline, type Raster, type Shape } from './raster'

const rect = (x0: number, y0: number, x1: number, y1: number): Outline => ({ start: [x0, y0], segments: [[[x1, y0]], [[x1, y1]], [[x0, y1]]] })
const box = (left: number, top: number, right: number, bottom: number): Box => ({ left, top, right, bottom })

// At 10 pixels to the em, a viewBox unit is a hundredth of a pixel.
const fill = (shapes: Shape[], viewBox = box(0, 0, 1000, 1000)): Raster => rasterize({ viewBox, shapes }, 10, [255, 0, 0])

// The alpha of the pixel `dx`, `dy` from the ink's top-left corner.
const alphaAt = (r: Raster, dx: number, dy: number) => r.rgba[((r.ink!.top + dy) * r.width + r.ink!.left + dx) * 4 + 3]!
const inkSize = (r: Raster) => [r.ink!.right - r.ink!.left, r.ink!.bottom - r.ink!.top]

describe('rasterize', () => {
  test('a rectangle fills exactly its pixels, opaque, in the colour, and nothing else', () => {
    const r = fill([{ outlines: [rect(0, 0, 500, 1000)] }])
    expect(inkSize(r)).toEqual([5, 10])
    expect(alphaAt(r, 2, 5)).toBe(255)
    const at = ((r.ink!.top + 5) * r.width + r.ink!.left + 2) * 4
    expect([...r.rgba.subarray(at, at + 3)]).toEqual([255, 0, 0])
  })

  test('an edge halfway through a pixel covers it half', () => {
    const r = fill([{ outlines: [rect(0, 0, 550, 1000)] }])
    expect(Math.abs(alphaAt(r, 5, 5) - 128)).toBeLessThanOrEqual(1)
  })

  test('within a shape, an outline wound the other way is a hole, the same way still filled', () => {
    const hole = fill([{ outlines: [rect(0, 0, 1000, 1000), rect(300, 700, 700, 300)] }])
    const doubled = fill([{ outlines: [rect(0, 0, 1000, 1000), rect(300, 300, 700, 700)] }])
    expect(alphaAt(hole, 5, 5)).toBe(0)
    expect(alphaAt(doubled, 5, 5)).toBe(255)
  })

  test('shapes are laid one over another, whichever way each is wound', () => {
    const r = fill([{ outlines: [rect(0, 0, 1000, 1000)] }, { outlines: [rect(300, 700, 700, 300)] }])
    expect(alphaAt(r, 5, 5)).toBe(255)
    // Two half-covering edges on one pixel: half, then half of what is left.
    const halves = fill([{ outlines: [rect(0, 0, 550, 1000)] }, { outlines: [rect(0, 0, 550, 1000)] }])
    expect(Math.abs(alphaAt(halves, 5, 5) - 191)).toBeLessThanOrEqual(1)
  })

  test('a shape is cut to its clip box', () => {
    const r = fill([{ outlines: [rect(0, 0, 1000, 1000)], clip: box(200, 300, 600, 1000) }])
    expect(inkSize(r)).toEqual([4, 7])
  })

  test('the baseline is where y = 0 falls; ink beyond the viewBox is drawn, not lost', () => {
    const r = fill([{ outlines: [rect(-300, -500, 300, 0)] }], box(0, -500, 1000, 500))
    expect(inkSize(r)).toEqual([6, 5])
    expect(r.ink!.bottom).toBe(r.baseline)
  })

  test('curves are filled to their outline, flattened within a tenth of a pixel: a quadratic bump covers two thirds of its box', () => {
    const r = fill([{ outlines: [{ start: [0, 1000], segments: [[[500, -1000], [1000, 1000]]] }] }])
    let sum = 0
    for (let i = 3; i < r.rgba.length; i += 4) sum += r.rgba[i]!
    expect(Math.abs(sum / 255 / 100 - 2 / 3)).toBeLessThan(0.01)
  })
})
