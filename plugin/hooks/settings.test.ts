import { describe, expect, test } from 'claude-code/testing'

import { DEFAULT_FIT } from './layout/fit'
import { FONTS } from './layout/geometry'
import { readSettings } from './settings'

describe('readSettings', () => {
  test("nothing set: the defaults, colours following the text, Ghostty's font", () => {
    expect(readSettings({})).toEqual({
      mathColor: undefined,
      typstColor: undefined,
      inlineScale: 1.2,
      fit: DEFAULT_FIT,
      font: FONTS['JetBrains Mono'],
      images: 'auto',
      typstPackages: true,
      promptNote: true,
    })
  })

  test('colours take six hex digits, with or without #', () => {
    expect(readSettings({ mathColor: '#B3BD5A', typstColor: 'a0a0a0' })).toMatchObject({ mathColor: 'b3bd5a', typstColor: 'a0a0a0' })
    expect(readSettings({ mathColor: 'green', typstColor: '#abc' })).toMatchObject({ mathColor: undefined, typstColor: undefined })
  })

  test('numbers are held to ranges that cannot break the layout', () => {
    const { inlineScale, fit } = readSettings({ inlineSize: 50, inlineMinScale: -1, inlineShiftUp: 'lots' })
    expect([inlineScale, fit.minScale, fit.shiftUp]).toEqual([3, 0.1, DEFAULT_FIT.shiftUp])
  })

  test('a field cleared, or only spaces, is its default, not its least', () => {
    const { inlineScale, fit } = readSettings({ inlineSize: '', inlineMinScale: '  ' })
    expect([inlineScale, fit.minScale]).toEqual([1.2, DEFAULT_FIT.minScale])
  })

  test('a font is a preset, or Custom with its own proportions', () => {
    expect(readSettings({ terminalFont: 'SF Mono' }).font).toEqual(FONTS['SF Mono'])
    expect(readSettings({ terminalFont: 'Custom', fontAspect: 2, fontXHeight: 0.45, fontBaseline: 0.8 }).font).toEqual({
      aspect: 2,
      xHeight: 0.45,
      baseline: 0.8,
    })
    expect(readSettings({ terminalFont: 'Comic Mono' }).font).toEqual(FONTS['JetBrains Mono'])
    expect(readSettings({ terminalFont: 'constructor' }).font).toEqual(FONTS['JetBrains Mono'])
    expect(readSettings({ terminalFont: 'sf mono' }).font).toEqual(FONTS['SF Mono'])
  })

  test('typst packages are allowed unless turned off', () => {
    expect(readSettings({ typstPackages: false }).typstPackages).toBe(false)
    expect(readSettings({ typstPackages: 'nonsense' }).typstPackages).toBe(true)
    expect(readSettings({ typstPackages: 'False', promptNote: ' off ' })).toMatchObject({ typstPackages: false, promptNote: false })
  })

  test('pictures: auto, always or never; anything else is auto', () => {
    expect(readSettings({ images: 'never' }).images).toBe('never')
    expect(readSettings({ images: 'sometimes' }).images).toBe('auto')
    expect(readSettings({ images: 'Always' }).images).toBe('always')
  })
})
