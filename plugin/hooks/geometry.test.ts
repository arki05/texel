import { expect, test } from 'claude-code/testing'

import { FONTS, gridFor } from './geometry'

test('a font becomes a grid of its proportions', () => {
  const grid = gridFor(FONTS['JetBrains Mono'])
  expect(grid.cellHeight / grid.cellWidth).toBe(2.2)
  expect(grid.xHeight / grid.cellHeight).toBe(0.4167)
  expect(grid.baseline).toBe(0.7727)
})
