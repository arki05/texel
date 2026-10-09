import { describe, expect, test } from 'claude-code/testing'

import { accented } from './accents'

describe('accented', () => {
  test('in text, a letter becomes the accent over its base, whatever text command holds it', () => {
    expect(accented('\\text{für}')).toBe('\\text{f{\\"{u}}r}')
    expect(accented('\\textbf{š} \\mbox{ñ}')).toBe('\\textbf{{\\v{s}}} \\mbox{{\\~{n}}}')
  })

  test('math stays as it is: outside text, and inside $…$ within it', () => {
    expect(accented('ä + \\mathrm{é}')).toBe('ä + \\mathrm{é}')
    expect(accented('\\text{a $é$ ü}')).toBe('\\text{a $é$ {\\"{u}}}')
  })

  test('letters the fonts cannot accent stay: i, j, ß, and accents they lack', () => {
    expect(accented('\\text{ï ß å}')).toBe('\\text{ï ß å}')
  })

  test('braces inside the text are its own, escaped ones too', () => {
    expect(accented('\\text{{é} \\} é} é')).toBe("\\text{{{\\'{e}}} \\} {\\'{e}}} é")
  })
})
