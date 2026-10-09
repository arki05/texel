// MathJax's SVG as a drawing raster.ts can fill: every element an outline,
// in the viewBox's units. MathJax draws with a small part of SVG, and this
// reads that part exactly:
//
// - <path>, <rect> and <polygon> filled; <line>, and a <rect> with
//   fill="none", stroked, the stroke made an outline here (butt ends, mitred
//   corners; round ends where dotted);
// - transforms: translate, scale, matrix and rotate;
// - a nested <svg> (a stretched delimiter's middle) placed at its x, y and
//   clipped to its box;
// - MathJax's stylesheet, which draws a table's rules and frame: STYLESHEET
//   below, held to MathJax's own by drawing.test.ts.
//
// A formula has one colour, so a \colorbox's background is left out. Anything
// else (a <text> for a character MathJax's fonts lack, an element, attribute
// or transform not above) fails the drawing, so the formula shows its source
// rather than a wrong picture.

import type { RenderFailure } from '../result'
import type { Box, Drawing, Outline, Point, Shape } from './raster'
import type { SvgNode } from './vendor/mathjax-entry'

/**
 * What MathJax's stylesheet does to its SVG, as far as drawing goes: each
 * rule's selector, and what this file makes of it.
 */
export const STYLESHEET = {
  /** The formula overflows its own box: ink beyond the viewBox is drawn. */
  root: { selector: 'mjx-container[jax="SVG"] > svg', overflow: 'visible' },
  /** A table's rules and frame are strokes 70 wide, unfilled. */
  rules: { selectors: ['g[data-mml-node="mtable"] > line[data-line]', 'g[data-mml-node="mtable"] > rect[data-frame]'], strokeWidth: 70 },
  /** Dashed and dotted ones, by class. */
  dashed: { selector: 'g[data-mml-node="mtable"] > .mjx-dashed', dashes: [140], round: false },
  dotted: { selector: 'g[data-mml-node="mtable"] > .mjx-dotted', dashes: [0, 140], round: true },
  /** An <svg> in a table's row is not clipped. */
  unclipped: { selector: 'g[data-mml-node="mtable"] > g > svg', overflow: 'visible' },
} as const

type Matrix = readonly [number, number, number, number, number, number]
type Dash = { dashes: readonly number[]; round: boolean }
/** What an element inherits from its parents. */
type Context = { matrix: Matrix; clip: Box | undefined; fill: boolean; stroke: boolean; strokeWidth: number }

class Unsupported extends Error {}

/** MathJax's `svg` as a drawing, or why it cannot be drawn faithfully. */
export function drawingOf(svg: SvgNode): Drawing | RenderFailure {
  try {
    const [left, top, width, height] = viewBoxOf(svg)
    const shapes: Shape[] = []
    // SVG's defaults: filled, unstroked.
    const context: Context = { matrix: IDENTITY, clip: undefined, fill: true, stroke: false, strokeWidth: 1 }
    for (const child of svg.children) walk(child, svg, undefined, context, shapes)
    return { viewBox: { left, top, right: left + width, bottom: top + height }, shapes }
  } catch (e) {
    if (e instanceof Unsupported) return { error: e.message }
    throw e
  }
}

// SVG's attributes that change what is drawn. One an element has that this
// file does not read for it fails the drawing. Any other is MathJax's own
// (data-*, a MathML attribute it copies over) or changes nothing drawn, and
// is passed over, as a browser does.
const DRAWING = /^(?:transform|style|fill|fill-rule|fill-opacity|stroke(?:-[a-z]+)?|opacity|display|visibility|overflow|clip|clip-path|clip-rule|mask|filter|marker(?:-[a-z]+)?|x|y|width|height|rx|ry|cx|cy|r|x1|y1|x2|y2|points|d|viewBox|preserveAspectRatio|href|xlink:href|pathLength)$/
const PAINT = ['transform', 'fill', 'stroke', 'stroke-width', 'style']
const ATTRIBUTES: Record<string, string[]> = {
  g: PAINT,
  svg: [...PAINT, 'x', 'y', 'width', 'height', 'viewBox', 'preserveAspectRatio'],
  path: [...PAINT, 'd'],
  rect: [...PAINT, 'x', 'y', 'width', 'height'],
  polygon: [...PAINT, 'points'],
  line: [...PAINT, 'x1', 'y1', 'x2', 'y2'],
}

function walk(node: SvgNode, parent: SvgNode, grandparent: SvgNode | undefined, outer: Context, shapes: Shape[]) {
  if (node.tag === 'text') throw new Unsupported(`MathJax's fonts have no ${JSON.stringify(node.text ?? '')}`)
  const allowed = ATTRIBUTES[node.tag]
  if (!allowed) throw new Unsupported(`MathJax drew a <${node.tag}>, which texel does not draw`)
  for (const name of Object.keys(node.attrs)) {
    // MathJax writes `stroke-thickness`, which SVG does not have; a table rule's
    // dashes are its stylesheet's, whatever the attribute says.
    const overridden = name === 'stroke-thickness' || (name === 'stroke-dasharray' && dashOf(node, parent))
    if (DRAWING.test(name) && !allowed.includes(name) && !overridden) throw new Unsupported(`MathJax drew a <${node.tag}> with ${name}, which texel does not draw`)
  }

  const here = paint(node, parent, outer)
  const { matrix } = here
  if (node.tag === 'g') {
    for (const child of node.children) walk(child, node, parent, here, shapes)
    return
  }
  if (node.tag === 'svg') {
    const [x, y, width, height] = ['x', 'y', 'width', 'height'].map(k => number(node, k)) as [number, number, number, number]
    const [vx, vy, vw, vh] = viewBoxOf(node)
    // MathJax's nested <svg>s show their viewBox at its own size.
    if (Math.abs(width - vw) > 0.01 || Math.abs(height - vh) > 0.01) throw new Unsupported('MathJax drew a scaled <svg>, which texel does not draw')
    const unclipped = parent.tag === 'g' && grandparent?.attrs['data-mml-node'] === 'mtable'
    const inner = { ...here, matrix: multiply(matrix, [1, 0, 0, 1, x - vx, y - vy]), clip: unclipped ? here.clip : intersect(here.clip, boxThrough(matrix, x, y, width, height)) }
    for (const child of node.children) walk(child, node, parent, inner, shapes)
    return
  }

  const outlines: Outline[] = []
  const dash = dashOf(node, parent)
  const stroked = here.stroke && here.strokeWidth > 0
  if (node.tag === 'path') {
    if (stroked) throw new Unsupported('MathJax drew a stroked <path>, which texel does not draw')
    if (here.fill) outlines.push(...outlinesOf(node.attrs.d ?? ''))
  } else if (node.tag === 'polygon') {
    if (stroked) throw new Unsupported('MathJax drew a stroked <polygon>, which texel does not draw')
    const points = numbers(node.attrs.points, -1)
    const corners = points.flatMap((_, j) => (j % 2 ? [] : [[points[j]!, points[j + 1]!] as Point]))
    if (here.fill && corners.length > 2) outlines.push({ start: corners[0]!, segments: corners.slice(1).map(p => [p]) })
  } else if (node.tag === 'rect') {
    // A coloured background: the formula has one colour, and this would hide it.
    if ('data-bgcolor' in node.attrs) return
    const [x, y, width, height] = ['x', 'y', 'width', 'height'].map(k => number(node, k, 0)) as [number, number, number, number]
    if (here.fill) outlines.push(rectangle(x, y, x + width, y + height))
    if (stroked) outlines.push(...frame(x, y, width, height, here.strokeWidth, dash))
  } else if (node.tag === 'line') {
    const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map(k => number(node, k, 0)) as [number, number, number, number]
    if (stroked) outlines.push(...stroke([x1, y1], [x2, y2], here.strokeWidth, dash).outlines)
  }
  if (node.children.length) throw new Unsupported(`MathJax drew a <${node.tag}> with children, which texel does not draw`)
  if (outlines.length) shapes.push({ outlines: outlines.map(o => mapped(matrix, o)), clip: here.clip })
}

// `node`'s context: its transform and paint over its parent's, by attribute,
// then MathJax's stylesheet, then its `style`, as CSS ranks them.
function paint(node: SvgNode, parent: SvgNode, outer: Context): Context {
  const declared: Record<string, string> = {}
  for (const key of ['fill', 'stroke', 'stroke-width']) if (node.attrs[key] !== undefined) declared[key] = node.attrs[key]!
  if (isRule(node, parent)) Object.assign(declared, { fill: 'none', 'stroke-width': String(STYLESHEET.rules.strokeWidth) })
  for (const [key, value] of declarations(node.attrs.style)) declared[key] = value
  const width = declared['stroke-width']
  return {
    matrix: multiply(outer.matrix, transform(node.attrs.transform ?? '')),
    clip: outer.clip,
    fill: declared.fill === undefined ? outer.fill : declared.fill !== 'none',
    stroke: declared.stroke === undefined ? outer.stroke : declared.stroke !== 'none',
    strokeWidth: width === undefined ? outer.strokeWidth : parseLength(width),
  }
}

// A table's rule or frame, as MathJax's stylesheet picks them out.
const isRule = (node: SvgNode, parent: SvgNode) =>
  parent.attrs['data-mml-node'] === 'mtable' && ((node.tag === 'line' && 'data-line' in node.attrs) || (node.tag === 'rect' && 'data-frame' in node.attrs))

function dashOf(node: SvgNode, parent: SvgNode): Dash | undefined {
  if (parent.attrs['data-mml-node'] !== 'mtable') return undefined
  const classes = (node.attrs.class ?? '').split(/\s+/)
  if (classes.includes('mjx-dashed')) return STYLESHEET.dashed
  if (classes.includes('mjx-dotted')) return STYLESHEET.dotted
  return undefined
}

// CSS box properties, which do nothing to SVG's shapes: MathJax writes an
// \fcolorbox's `border` on its group, say, and draws the border itself.
const BOX_PROPERTY = /^(?:vertical-align|(?:margin|padding|border)(?:-[a-z]+)*|(?:min-|max-)?(?:width|height))$/

// The declarations of a `style` attribute that bear on drawing.
function declarations(style = ''): [string, string][] {
  const out: [string, string][] = []
  for (const declaration of style.split(';')) {
    const [key = '', value = ''] = declaration.split(':').map(s => s.trim())
    if (!key) continue
    if (['fill', 'stroke', 'stroke-width'].includes(key)) out.push([key, value])
    else if (!BOX_PROPERTY.test(key)) {
      throw new Unsupported(`MathJax drew with style ${key}, which texel does not draw`)
    }
  }
  return out
}

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]

function multiply(m: Matrix, n: Matrix): Matrix {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ]
}

const apply = (m: Matrix, [x, y]: Point): Point => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
const mapped = (m: Matrix, o: Outline): Outline => ({ start: apply(m, o.start), segments: o.segments.map(s => s.map(p => apply(m, p))) })

// An SVG `transform`: translate, scale, rotate and matrix, in order.
function transform(text: string): Matrix {
  let m = IDENTITY
  const operation = /\s*(\w+)\s*\(([^)]*)\)\s*,?/y
  for (let match; (match = operation.exec(text)); ) {
    const [, op, args = ''] = match
    const v = numbers(args, -1)
    if (op === 'translate' && v.length <= 2) m = multiply(m, [1, 0, 0, 1, v[0] ?? 0, v[1] ?? 0])
    else if (op === 'scale' && v.length <= 2) m = multiply(m, [v[0] ?? 1, 0, 0, v[1] ?? v[0] ?? 1, 0, 0])
    else if (op === 'matrix' && v.length === 6) m = multiply(m, v as unknown as Matrix)
    else if (op === 'rotate' && (v.length === 1 || v.length === 3)) {
      const [a = 0, cx = 0, cy = 0] = v
      const [cos, sin] = [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)]
      m = multiply(m, [1, 0, 0, 1, cx, cy])
      m = multiply(m, [cos, sin, -sin, cos, 0, 0])
      m = multiply(m, [1, 0, 0, 1, -cx, -cy])
    } else throw new Unsupported(`MathJax drew with transform ${op}(${args}), which texel does not draw`)
    if (operation.lastIndex === text.length) break
  }
  if (text.trim() && operation.lastIndex !== text.length) throw new Unsupported(`MathJax drew with transform ${text}, which texel does not draw`)
  return m
}

// The box `x`, `y`, `width`, `height` through `m`, which must keep it a box.
function boxThrough(m: Matrix, x: number, y: number, width: number, height: number): Box {
  if (m[1] !== 0 || m[2] !== 0) throw new Unsupported('MathJax drew a turned <svg>, which texel does not draw')
  const [a, b] = [apply(m, [x, y]), apply(m, [x + width, y + height])]
  return { left: Math.min(a[0], b[0]), top: Math.min(a[1], b[1]), right: Math.max(a[0], b[0]), bottom: Math.max(a[1], b[1]) }
}

function intersect(a: Box | undefined, b: Box): Box {
  if (!a) return b
  return { left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) }
}

function numbers(text = '', count: number): number[] {
  const values = text.split(/[\s,]+/).filter(Boolean).map(Number)
  if ((count >= 0 && values.length !== count) || values.some(Number.isNaN)) throw new Unsupported(`MathJax drew with ${JSON.stringify(text)}, which texel does not read`)
  return values
}

const viewBoxOf = (node: SvgNode) => numbers(node.attrs.viewBox, 4) as [number, number, number, number]

function number(node: SvgNode, key: string, fallback?: number): number {
  const text = node.attrs[key]
  if (text === undefined && fallback !== undefined) return fallback
  return parseLength(text ?? '')
}

// A length in user units: a number, or one in `px`, which are the same.
function parseLength(text: string): number {
  const value = Number(text.trim().replace(/px$/, ''))
  if (text.trim() === '' || Number.isNaN(value)) throw new Unsupported(`MathJax drew with length ${JSON.stringify(text)}, which texel does not read`)
  return value
}

/** A path's `d` as outlines, every command made absolute (arcs, which MathJax does not draw, refused). */
export function outlinesOf(d: string): Outline[] {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? []
  const outlines: Outline[] = []
  let outline: Outline | undefined
  let cur: Point = [0, 0]
  let control: Point | undefined
  let command = ''
  let i = 0
  const num = () => Number(tokens[i++])
  const segment = (...points: Point[]) => {
    outline ??= { start: cur, segments: [] }
    outline.segments.push(points)
    cur = points[points.length - 1]!
  }
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i]!)) command = tokens[i++]!
    const relative = command === command.toLowerCase()
    const at = (x: number, y: number): Point => (relative ? [cur[0] + x, cur[1] + y] : [x, y])
    const mirrored = (): Point => (control ? [2 * cur[0] - control[0], 2 * cur[1] - control[1]] : cur)
    const kind = command.toUpperCase()
    if (kind === 'M') {
      if (outline) outlines.push(outline)
      cur = at(num(), num())
      outline = { start: cur, segments: [] }
      command = relative ? 'l' : 'L' // further pairs are lines
      control = undefined
    } else if (kind === 'L') {
      segment(at(num(), num()))
      control = undefined
    } else if (kind === 'H') {
      segment([relative ? cur[0] + num() : num(), cur[1]])
      control = undefined
    } else if (kind === 'V') {
      segment([cur[0], relative ? cur[1] + num() : num()])
      control = undefined
    } else if (kind === 'Q' || kind === 'T') {
      const c = kind === 'Q' ? at(num(), num()) : mirrored()
      segment(c, at(num(), num()))
      control = c
    } else if (kind === 'C' || kind === 'S') {
      const c1 = kind === 'C' ? at(num(), num()) : mirrored()
      const c2 = at(num(), num())
      segment(c1, c2, at(num(), num()))
      control = c2
    } else if (kind === 'Z') {
      if (outline) {
        outlines.push(outline)
        cur = outline.start
        outline = undefined
      }
      control = undefined
    } else {
      throw new Unsupported(`MathJax drew a path with ${command}, which texel does not draw`)
    }
  }
  if (outline) outlines.push(outline)
  return outlines.filter(o => o.segments.length > 0)
}

// A rectangle's outline, from one corner to the opposite one.
const rectangle = (x0: number, y0: number, x1: number, y1: number): Outline => ({
  start: [x0, y0],
  segments: [[[x1, y0]], [[x1, y1]], [[x0, y1]]],
})

// A rect's stroke `width` wide, centred on its edge: solid, the ring between
// two rectangles wound opposite ways, mitred at the corners; dashed, each
// side in turn, the dashes running on round the corners.
function frame(x: number, y: number, w: number, h: number, width: number, dash: Dash | undefined): Outline[] {
  const t = width / 2
  if (!dash) {
    const outer = rectangle(x - t, y - t, x + w + t, y + h + t)
    if (w <= width || h <= width) return [outer]
    return [outer, rectangle(x + t, y + h - t, x + w - t, y + t)]
  }
  const corners: Point[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]
  const outlines: Outline[] = []
  let phase = 0
  for (let j = 0; j + 1 < corners.length; j++) {
    const side = stroke(corners[j]!, corners[j + 1]!, width, dash, phase)
    outlines.push(...side.outlines)
    phase = side.phase
  }
  return outlines
}

// A stroke `width` wide from `a` to `b`: one butt-ended bar, or its dashes
// from `phase` along the dash pattern, round-ended where dotted. Returns the
// phase it ends at, for a stroke that carries on.
function stroke(a: Point, b: Point, width: number, dash: Dash | undefined, phase = 0): { outlines: Outline[]; phase: number } {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1])
  const at = (s: number): Point => [a[0] + ((b[0] - a[0]) * s) / length, a[1] + ((b[1] - a[1]) * s) / length]
  if (!dash) return { outlines: length ? [bar(a, b, width, false)] : [], phase }
  // An odd list of dashes repeats to make an even one, as in SVG.
  const pattern = dash.dashes.length % 2 ? [...dash.dashes, ...dash.dashes] : [...dash.dashes]
  const period = pattern.reduce((sum, d) => sum + d, 0)
  const outlines: Outline[] = []
  // Walk the pattern from the start of the period `phase` falls in.
  let s = -(phase % period)
  for (let j = 0; s <= length; j = (j + 1) % pattern.length) {
    const end = s + pattern[j]!
    if (j % 2 === 0 && end >= 0) {
      const [from, to] = [Math.max(0, s), Math.min(length, end)]
      if (to > from || (dash.round && s >= 0)) outlines.push(bar(at(from), at(to), width, dash.round))
    }
    s = end
  }
  return { outlines, phase: phase + length }
}

// A bar `width` wide from `a` to `b`, square-ended or, `round`, with half
// circles (a dot where `a` is `b`), wound one way whichever way it runs.
function bar(a: Point, b: Point, width: number, round: boolean): Outline {
  const t = width / 2
  const length = Math.hypot(b[0] - a[0], b[1] - a[1])
  const [ux, uy] = length ? [(b[0] - a[0]) / length, (b[1] - a[1]) / length] : [1, 0]
  const [nx, ny] = [-uy * t, ux * t]
  const side = (p: Point, sign: 1 | -1): Point => [p[0] + sign * nx, p[1] + sign * ny]
  if (!round) return { start: side(a, 1), segments: [[side(b, 1)], [side(b, -1)], [side(a, -1)]] }
  // Each half circle as two quarter arcs, cubic Béziers with the usual 0.5523.
  const k = 0.5523
  const [fx, fy] = [ux * t, uy * t]
  const cap = (p: Point, sign: 1 | -1): Point[][] => {
    const [ox, oy, dx, dy] = [sign * nx, sign * ny, sign * fx, sign * fy]
    const tip: Point = [p[0] + dx, p[1] + dy]
    const end: Point = [p[0] - ox, p[1] - oy]
    return [
      [[p[0] + ox + k * dx, p[1] + oy + k * dy], [tip[0] + k * ox, tip[1] + k * oy], tip],
      [[tip[0] - k * ox, tip[1] - k * oy], [end[0] + k * dx, end[1] + k * dy], end],
    ]
  }
  return { start: side(a, 1), segments: [[side(b, 1)], ...cap(b, 1), [side(a, -1)], ...cap(a, -1)] }
}
