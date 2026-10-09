import { describe, expect, test } from 'claude-code/testing'

import { needsRender, parse, tokenize } from './parse'

describe('parse', () => {
  test('plain markdown passes through untouched', () => {
    const segments = parse('Hello **world**.\n\n- a\n- b\n\nIt costs $5 and $10.')
    expect(needsRender(segments)).toBe(false)
  })

  test('display math, math and typst fences', () => {
    const text = 'Intro\n\n$$\n\\int_0^1 x\\,dx\n$$\n\n```math\nE = mc^2\n```\n\n```typst\n$ a^2 $\n```\n\n```ts\nconst x = 1\n```'
    expect(parse(text).map(s => (s.kind === 'block' ? s.renderer : s.kind))).toEqual(['markdown', 'math', 'math', 'typst', 'markdown'])
  })

  test('latex and tex fences are source to copy, and stay code', () => {
    expect(needsRender(parse('```latex\n\\frac{a}{b}\n```'))).toBe(false)
    expect(needsRender(parse('```tex\n\\documentclass{article}\n```'))).toBe(false)
  })

  test('a line full of unclosed \\( is read in linear time', () => {
    const start = Date.now()
    expect(needsRender(parse('a \\( '.repeat(4000)))).toBe(false)
    expect(Date.now() - start).toBeLessThan(1000)
  })

  test('an escaped backslash is no delimiter: \\\\( is a backslash and a parenthesis', () => {
    expect(needsRender(parse('Escape it as \\\\(x\\\\) or \\\\[y\\\\] in Markdown.'))).toBe(false)
    expect(parse('A pair, then math: \\\\\\(x\\)').map(s => s.kind)).toEqual(['paragraph'])
  })

  test('inline math becomes a paragraph of atoms', () => {
    const [seg] = parse('The area $\\pi r^2$, **grows** fast.')
    if (seg?.kind !== 'paragraph') throw new Error('expected paragraph')
    expect(seg.lines[0]?.atoms).toEqual([
      { kind: 'text', text: 'The area ' },
      { kind: 'math', tex: '\\pi r^2', source: '$\\pi r^2$' },
      { kind: 'text', text: ', ' },
      { kind: 'text', text: 'grows', bold: true },
      { kind: 'text', text: ' fast.' },
    ])
  })

  test('dollars inside code spans are not math', () => {
    expect(needsRender(parse('Run `echo $HOME$` now.'))).toBe(false)
    expect(tokenize('`$x$`')).toEqual([{ kind: 'text', text: '$x$', code: true }])
  })

  test('prices next to code spans stay prose', () => {
    const [seg] = parse('Euler $e^{i\\pi}$. Prices like $5 and $10 stay text, and so does `$HOME`.')
    if (seg?.kind !== 'paragraph') throw new Error('expected paragraph')
    expect(seg.lines[0]?.atoms.filter(a => a.kind === 'math')).toEqual([{ kind: 'math', tex: 'e^{i\\pi}', source: '$e^{i\\pi}$' }])
  })

  test('delimiters inside code spans are not math', () => {
    const text = 'Earlier messages with `$$` in them render too.\n\n---\n\n$$\n\\int_0^1 x\\,dx\n$$\n\n$$\n\\begin{pmatrix} a \\\\ b \\end{pmatrix}\n$$'
    const display = parse(text).filter(s => s.kind === 'block')
    expect(display.map(s => (s.kind === 'block' ? s.body : ''))).toEqual(['\\int_0^1 x\\,dx', '\\begin{pmatrix} a \\\\ b \\end{pmatrix}'])
    expect(needsRender(parse('It handles (`$$…$$`, `\\[…\\]`, fences), and `$…$`.'))).toBe(false)
  })

  test('display math never spans a paragraph break', () => {
    expect(needsRender(parse('A lone $$ here.\n\nAnd another $$ there.'))).toBe(false)
  })

  test('empty math stays source', () => {
    expect(needsRender(parse('$$  $$'))).toBe(false)
    expect(needsRender(parse('an empty \\(  \\) here'))).toBe(false)
  })

  test('\\( \\) and \\[ \\] are math; \\$ is a dollar', () => {
    const [seg] = parse('Take \\( \\frac{x^2}{y} \\) for \\$3.')
    if (seg?.kind !== 'paragraph') throw new Error('expected paragraph')
    expect(seg.lines[0]?.atoms).toEqual([
      { kind: 'text', text: 'Take ' },
      { kind: 'math', tex: '\\frac{x^2}{y}', source: '\\( \\frac{x^2}{y} \\)' },
      { kind: 'text', text: ' for $3.' },
    ])
    expect(parse('\\[\\forall x: \\sum x\\]').map(s => s.kind)).toEqual(['block'])
  })

  test('display delimiters mid-sentence split the paragraph, as in LaTeX', () => {
    expect(parse('so $$\\frac{3}{4}$$ of it, and \\[x\\] too').map(s => s.kind)).toEqual([
      'markdown',
      'block',
      'markdown',
      'block',
      'markdown',
    ])
  })

  test('list items keep their markers', () => {
    const [seg] = parse('- first $x$\n- second\n  continued')
    if (seg?.kind !== 'paragraph') throw new Error('expected paragraph')
    expect(seg.lines.map(l => l.prefix)).toEqual(['• ', '• '])
    expect(seg.lines[1]?.atoms).toEqual([{ kind: 'text', text: 'second continued' }])
  })

  test('an unclosed fence streaming in stays source', () => {
    expect(needsRender(parse('Look:\n\n```bash\necho $a$ $b$'))).toBe(false)
  })
})

describe('parse: markdown around math', () => {
  const kinds = (text: string) => parse(text).map(s => s.kind)
  const lineTexts = (text: string) => {
    const [seg] = parse(text)
    if (seg?.kind !== 'paragraph') throw new Error('expected paragraph')
    return seg.lines.map(line => line.atoms.map(a => (a.kind === 'text' ? a.text : `[${a.tex}]`)).join(''))
  }

  test('a nested list indented by four spaces is a list, not code', () => {
    expect(kinds('- a \\(x\\)\n    - b \\(y\\)')).toEqual(['paragraph'])
    expect(kinds('    code \\(x\\) here')).toEqual(['markdown'])
  })

  test('a heading stays one line; the body after it is its own', () => {
    expect(lineTexts('## Heading\nBody with \\(x\\)')).toEqual(['Heading', 'Body with [x]'])
  })

  test('Windows line ends still break paragraphs', () => {
    expect(kinds('a \\(x\\) b\r\n\r\nc \\(y\\) d')).toEqual(['paragraph', 'paragraph'])
  })

  test('escaped punctuation is shown as itself, and is no delimiter', () => {
    expect(lineTexts('\\*not italic\\* and \\_nor this\\_ near \\(x\\)')).toEqual(['*not italic* and _nor this_ near [x]'])
  })
})
