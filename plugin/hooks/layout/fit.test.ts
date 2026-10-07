import { describe, expect, test } from 'claude-code/testing'

import type { Ink } from '../render/typst'
import { fitInline } from './fit'

// Ghostty's default cell; the baseline 13.14pt down a 17pt row.
const grid = { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 }
const fit = (ink: Ink, maxColumns = 90) => {
  const { above, below, placement } = fitInline(ink, grid, maxColumns)
  return { above, below, ...placement }
}

describe('fitInline', () => {
  test('a letter sits on the baseline in its own row, full size', () => {
    const f = fit({ width: 8, above: 7.9, below: 0.2 })
    expect([f.above, f.below, f.scale]).toEqual([0, 0, 1])
    expect(Math.abs(f.dy - (13.14 - 7.9))).toBeLessThan(0.01)
  })

  test('a superscript slides down within the row rather than shrink', () => {
    const f = fit({ width: 14, above: 14.8, below: 0.2 })
    expect([f.above, f.below, f.scale]).toEqual([0, 0, 1])
    expect(f.dy).toBe(0)
  })

  test('a fraction too tall for one row takes a row above first', () => {
    const f = fit({ width: 16, above: 17.6, below: 8.7 })
    expect([f.above, f.below]).toEqual([1, 0])
    expect(f.scale).toBeGreaterThanOrEqual(0.75)
  })

  test('a little squeeze is taken before a whole row', () => {
    const f = fit({ width: 16, above: 13, below: 4.6 })
    expect([f.above, f.below]).toEqual([0, 0])
    expect(f.scale).toBeGreaterThanOrEqual(0.75)
  })

  test('a tall matrix alternates rows above and below until it fits', () => {
    const f = fit({ width: 60, above: 40, below: 30 })
    expect(f.above + f.below).toBeGreaterThanOrEqual(3)
    expect(f.above - f.below).toBeGreaterThanOrEqual(0)
    expect(f.above - f.below).toBeLessThanOrEqual(1)
    expect(f.scale).toBeGreaterThanOrEqual(0.75)
  })

  test('a formula too wide for the line shrinks without growing rows', () => {
    const f = fit({ width: 400, above: 7.9, below: 0.2 }, 20)
    expect([f.above, f.below]).toEqual([0, 0])
    expect(f.columns).toBe(20)
  })
})
