import { describe, expect, test } from 'claude-code/testing'

import { importsPackage, program, widthFree, withoutPageRules, type TypstStyle } from './program'

const style: TypstStyle = { grid: { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 }, color: 'e6e6e6' }
const block = (maxColumns: number, typst = 'hi') => ({ kind: 'typst', typst, maxColumns }) as const

describe('program', () => {
  test("the block's markup is the body of texel.typ's typst-block; the rest are inputs", () => {
    const { source, inputs } = program(block(80, '= Title'), style)
    expect(source).toBe('#import "/texel.typ": *\n#typst-block[\n= Title\n]\n')
    expect(inputs).toEqual({ 'cell-width': '7.8', 'cell-height': '17', 'x-height': '7.15', foreground: 'e6e6e6', 'max-columns': '80' })
  })

  test('a block depends on the width; width-free, its programs agree', () => {
    expect(program(block(40), style)).not.toEqual(program(block(120), style))
    expect(widthFree(program(block(40), style))).toEqual(widthFree(program(block(120), style)))
  })
})

describe('withoutPageRules', () => {
  test('a page rule goes, nested parentheses and strings with them, its line breaks kept', () => {
    const typst = '#set page(width: auto,\n  margin: (x: 8pt, y: calc.max(1, 2) * 1pt), header: ")")\n#set text(size: 9pt)\nhi'
    expect(withoutPageRules(typst)).toBe('\n\n#set text(size: 9pt)\nhi')
    expect(program(block(80, typst), style).source).toContain('#typst-block[\n\n\n#set text(size: 9pt)\nhi\n]')
  })

  test('a parenthesis in content, a string or a comment does not close it; prose is not a rule', () => {
    expect(withoutPageRules('#set page(width: 1cm, header: [ ) ( ])\nz')).toBe('\nz')
    expect(withoutPageRules('#set page(width: 1cm, // see (note\n  height: ")")\nz')).toBe('\n\nz')
    expect(withoutPageRules('Please set page(s) margins.')).toBe('Please set page(s) margins.')
  })

  test('inside code, too; other rules and unclosed ones stay', () => {
    expect(withoutPageRules('#{ set page(height: auto); [x] }')).toBe('#{ ; [x] }')
    expect(withoutPageRules('#set pagebreak-weak(x)\n#set page(')).toBe('#set pagebreak-weak(x)\n#set page(')
  })
})

describe('importsPackage', () => {
  test('a package import or include is one; local files and plain text are not', () => {
    expect(importsPackage('#import "@preview/cetz:0.4.2"\n#cetz.canvas({})')).toBe(true)
    expect(importsPackage('#include "@local/notes:0.1.0"')).toBe(true)
    expect(importsPackage('#import "util.typ": *')).toBe(false)
    expect(importsPackage('mail me at "@preview/x" later')).toBe(false)
    expect(importsPackage('#{ import "@preview/cetz:0.3.0": * }')).toBe(true)
    expect(importsPackage('#show: it => { import "@preview/a:1": *; it }')).toBe(true)
    expect(importsPackage('#import ("@preview/a:1.0.0")')).toBe(true)
  })
})
