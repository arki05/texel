import { describe, expect, test } from 'claude-code/testing'

import { DEFAULT_FIT } from './layout/fit'
import { readSettings } from './settings'

describe('readSettings', () => {
  test('nothing set: the defaults, colours following the text', () => {
    expect(readSettings({})).toEqual({ mathColor: undefined, typstColor: undefined, inlineScale: 1.2, fit: DEFAULT_FIT })
  })

  test('colours take six hex digits, with or without #', () => {
    expect(readSettings({ mathColor: '#B3BD5A', typstColor: 'a0a0a0' })).toMatchObject({ mathColor: 'b3bd5a', typstColor: 'a0a0a0' })
    expect(readSettings({ mathColor: 'green', typstColor: '#abc' })).toMatchObject({ mathColor: undefined, typstColor: undefined })
  })

  test('numbers are held to ranges that cannot break the layout', () => {
    const { inlineScale, fit } = readSettings({ inlineSize: 50, inlineMinScale: -1, inlineShiftUp: 'lots' })
    expect([inlineScale, fit.minScale, fit.shiftUp]).toEqual([3, 0.1, DEFAULT_FIT.shiftUp])
  })
})
