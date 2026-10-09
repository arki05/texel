import { describe, expect, test } from 'claude-code/testing'

import { isFailure } from '../result'
import { CORPUS } from './corpus'
import { drawingOf, outlinesOf, STYLESHEET } from './drawing'
import type { Drawing } from './raster'
import { createTex, stylesheet, type SvgNode } from './vendor/mathjax-entry.js'

const node = (tag: string, attrs: Record<string, string> = {}, ...children: SvgNode[]): SvgNode => ({ tag, attrs, children })
const svg = (...children: SvgNode[]) => node('svg', { viewBox: '0 0 1000 1000' }, ...children)

function drawn(root: SvgNode): Drawing {
  const d = drawingOf(root)
  if (isFailure(d)) throw new Error(d.error)
  return d
}
// Every point of every outline, after transforms.
const points = (d: Drawing) => d.shapes.flatMap(s => s.outlines.flatMap(o => [o.start, ...o.segments.flat()]))

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

describe('drawingOf', () => {
  test('transforms nest: translate, scale, and rotate about a point', () => {
    const d = drawn(svg(node('g', { transform: 'translate(100, 0) scale(2)' }, node('path', { d: 'M0 0L10 0L10 10Z', transform: 'rotate(90 10 0)' }))))
    expect(points(d).map(([x, y]) => [Math.round(x), Math.round(y)])).toEqual([[120, -20], [120, 0], [100, 0]])
  })

  test('a rect with fill="none" is its stroke: a ring, wound against its outside', () => {
    const d = drawn(svg(node('rect', { x: '100', y: '100', width: '800', height: '400', fill: 'none', stroke: 'black', 'stroke-width': '60' })))
    const [outer, inner] = d.shapes[0]!.outlines
    expect(outer!.start).toEqual([70, 70])
    expect(inner!.start).toEqual([130, 470])
  })

  test('a line is a bar as wide as its stroke; unstroked, nothing', () => {
    const line = (attrs: Record<string, string>) => node('line', { x1: '0', y1: '500', x2: '1000', y2: '500', ...attrs })
    expect(points(drawn(svg(line({ stroke: 'black', 'stroke-width': '60' }))))).toEqual([[0, 530], [1000, 530], [1000, 470], [0, 470]])
    expect(drawn(svg(line({}))).shapes).toEqual([])
  })

  test('a nested svg is placed at its x, y and clipped to its box', () => {
    const inner = node('svg', { x: '100', y: '200', width: '300', height: '400', viewBox: '50 0 300 400' }, node('path', { d: 'M0 0H1000V1000Z' }))
    const [shape] = drawn(svg(inner)).shapes
    expect(shape!.outlines[0]!.start).toEqual([50, 200])
    expect(shape!.clip).toEqual({ left: 100, top: 200, right: 400, bottom: 600 })
  })

  test("a background is left out; a text MathJax's fonts lack, or an element or transform unknown, fails", () => {
    expect(drawn(svg(node('rect', { x: '0', y: '0', width: '10', height: '10', 'data-bgcolor': 'true' }))).shapes).toEqual([])
    expect(drawingOf(svg({ ...node('text'), text: 'П' }))).toEqual({ error: 'MathJax\'s fonts have no "П"' })
    expect(drawingOf(svg(node('ellipse')))).toMatchObject({ error: expect.stringContaining('<ellipse>') })
    expect(drawingOf(svg(node('g', { transform: 'skewX(10)' })))).toMatchObject({ error: expect.stringContaining('skewX') })
    expect(drawingOf(svg(node('path', { d: 'M0 0A1 1 0 0 0 5 5' })))).toMatchObject({ error: expect.stringContaining('A') })
  })
})

describe("MathJax's stylesheet", () => {
  // Each rule of MathJax's stylesheet, and why drawing.ts draws by it or need not.
  const READ = 'drawing.ts reads it'
  const RULES: Record<string, string> = {
    [STYLESHEET.root.selector]: READ,
    ...Object.fromEntries(STYLESHEET.rules.selectors.map(selector => [selector, READ])),
    [STYLESHEET.dashed.selector]: READ,
    // TeX asks for solid and dashed rules only.
    'g[data-mml-node="mtable"] > .mjx-dotted': 'TeX draws no dotted rules',
    [STYLESHEET.unclipped.selector]: READ,
    // A hairline round every glyph, 3 thousandths of an em: under a tenth of a pixel here.
    'mjx-container[jax="SVG"] path[data-c], mjx-container[jax="SVG"] use[data-c]': 'not drawn: too thin to show',
    // A TeX error is shown as its source, never drawn.
    'g[data-mml-node="merror"] > g': 'errors are not drawn',
    'g[data-mml-node="merror"] > rect[data-background]': 'errors are not drawn',
    // Links (<a>) and actions are refused as unknown elements, and the rest is the page's.
    'mjx-container[jax="SVG"] > svg a': 'links are refused',
    'g[data-mml-node="maction"][data-toggle]': 'a cursor',
    'mjx-container[jax="SVG"]': 'page layout',
    'mjx-container[jax="SVG"][display="true"]': 'page layout',
    'mjx-container[jax="SVG"][display="true"][width="full"]': 'page layout',
    'mjx-container[jax="SVG"][justify="left"]': 'page layout',
    'mjx-container[jax="SVG"][justify="right"]': 'page layout',
    '[jax="SVG"] mjx-tool': 'page layout',
    '[jax="SVG"] mjx-tool > mjx-tip': 'page layout',
    'mjx-tool > mjx-tip': 'page layout',
    'mjx-status': 'page layout',
    'foreignObject[data-mjx-xml]': 'page layout',
  }

  // Selector to declarations; a rule's selectors for a table inside an outer <svg> (svg[data-table], for \tag) left out,
  // as such a table is refused.
  const rules = new Map(
    [...stylesheet().matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) => [
      selector!.trim().split(/,\s*/).filter(s => !s.startsWith('svg[data-table]')).join(', '),
      Object.fromEntries(body!.split(';').map(d => d.split(':').map(s => s.trim())).filter(([k]) => k)),
    ]),
  )

  test('every rule is one drawing.ts knows about', () => {
    expect([...rules.keys()].sort()).toEqual(Object.keys(RULES).sort())
  })

  test('the rules drawing.ts reads say what it reads', () => {
    expect(rules.get(STYLESHEET.root.selector)).toMatchObject({ overflow: 'visible' })
    for (const selector of STYLESHEET.rules.selectors) {
      expect(rules.get(selector)).toEqual({ 'stroke-width': `${STYLESHEET.rules.strokeWidth}px`, fill: 'none' })
    }
    expect(rules.get(STYLESHEET.dashed.selector)).toEqual({ 'stroke-dasharray': STYLESHEET.dashed.dashes.join(',') })
    expect(rules.get(STYLESHEET.unclipped.selector)).toEqual({ overflow: 'visible' })
  })
})

describe('what MathJax draws', () => {
  test('every formula in the corpus is drawn, none refused', () => {
    const tex = createTex('')
    for (const source of CORPUS) {
      const svgOrError = tex.convert(source, true)
      expect([source, 'error' in svgOrError ? svgOrError.error : 'ok']).toEqual([source, 'ok'])
      const drawing = drawingOf(svgOrError as SvgNode)
      expect([source, isFailure(drawing) ? drawing.error : 'ok']).toEqual([source, 'ok'])
    }
  })

  test('a character outside MathJax\'s fonts is refused by name', () => {
    expect(drawingOf(createTex('').convert('\\text{Привет}', false) as SvgNode)).toEqual({ error: 'MathJax\'s fonts have no "П"' })
    expect(drawingOf(createTex('').convert('\\text{Straße}', false) as SvgNode)).toEqual({ error: 'MathJax\'s fonts have no "ß"' })
  })
})
