// MathJax's SVG as a drawing raster.ts can fill: every element an outline,
// in the viewBox's units. MathJax draws with a small part of SVG, and this
// reads that part exactly:
//
// - <path>, <rect> and <polygon> filled; <line>, and a <rect> with
//   fill="none", stroked, the stroke made an outline here (butt ends, mitred
//   corners);
// - transforms: translate, scale, matrix and rotate;
// - a nested <svg> (a stretched delimiter's middle) placed at its x, y and
//   clipped to its box;
// - MathJax's stylesheet, which draws a table's rules and frame, solid or
//   dashed: STYLESHEET below, held to MathJax's own by drawing.test.ts.
//
// A formula has one colour, so a \colorbox's background is left out. An
// element or transform not above (a <text> for a character MathJax's fonts
// lack, say) fails the drawing, so the formula shows its source rather than
// a wrong picture.

import type { RenderFailure } from '../result'
import type { Box, Drawing, Outline, Point, Shape } from './raster'
import type { SvgNode } from './vendor/mathjax-entry'

/** An element where it sits: what MathJax's stylesheet selects by. */
type At = { node: SvgNode; parent: SvgNode; grandparent?: SvgNode }

const inTable = (element: SvgNode | undefined) => element?.attrs['data-mml-node'] === 'mtable'

/**
 * What MathJax's stylesheet does to its SVG, as far as drawing goes: each
 * rule's selector, what it does, and the elements it applies to.
 */
export const STYLESHEET = {
  /** The formula overflows its own box: ink beyond the viewBox is drawn (raster.ts). */
  root: { selector: 'mjx-container[jax="SVG"] > svg', overflow: 'visible' },
  /** A table's rules and frame are strokes 70 wide, unfilled. */
  rules: {
    selectors: ['g[data-mml-node="mtable"] > line[data-line]', 'g[data-mml-node="mtable"] > rect[data-frame]'],
    strokeWidth: 70,
    applies: ({ node, parent }: At) =>
      inTable(parent) && ((node.tag === 'line' && 'data-line' in node.attrs) || (node.tag === 'rect' && 'data-frame' in node.attrs)),
  },
  /** Dashed ones, by class: TeX's `:` and \hdashline. (Dotted ones TeX cannot ask for.) */
  dashed: {
    selector: 'g[data-mml-node="mtable"] > .mjx-dashed',
    dashes: [140],
    applies: ({ node, parent }: At) => inTable(parent) && (node.attrs.class ?? '').split(/\s+/).includes('mjx-dashed'),
  },
  /** An <svg> in a table's row is not clipped. */
  unclipped: {
    selector: 'g[data-mml-node="mtable"] > g > svg',
    overflow: 'visible',
    applies: ({ node, parent, grandparent }: At) => node.tag === 'svg' && parent.tag === 'g' && inTable(grandparent),
  },
} as const

type Matrix = readonly [number, number, number, number, number, number]
type Dash = { dashes: readonly number[] }
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
    for (const child of svg.children) walk({ node: child, parent: svg }, context, shapes)
    return { viewBox: { left, top, right: left + width, bottom: top + height }, shapes }
  } catch (e) {
    if (e instanceof Unsupported) return { error: e.message }
    throw e
  }
}

const ELEMENTS = new Set(['g', 'svg', 'path', 'rect', 'polygon', 'line'])

// An element and everything in it, its shapes added to `shapes`: a group's
// children, a nested <svg>'s placed and clipped, or a shape of its own.
function walk(at: At, outer: Context, shapes: Shape[]) {
  const { node } = at
  if (node.tag === 'text') throw new Unsupported(`MathJax's fonts have no ${JSON.stringify(node.text ?? '')}`)
  if (!ELEMENTS.has(node.tag)) throw new Unsupported(`MathJax drew a <${node.tag}>, which texel does not draw`)
  const here = paint(at, outer)
  const inside = node.tag === 'svg' ? nested(at, here) : node.tag === 'g' ? here : undefined
  if (inside) {
    for (const child of node.children) walk({ node: child, parent: node, grandparent: at.parent }, inside, shapes)
    return
  }
  const outlines = outlinesFor(at, here)
  if (outlines.length) shapes.push({ outlines: outlines.map(o => mapped(here.matrix, o)), clip: here.clip })
}

// What a nested <svg>'s children are drawn in: placed at its x, y, and
// clipped to its box, unless the stylesheet lets it overflow.
function nested(at: At, here: Context): Context {
  const { node } = at
  const [x, y, width, height] = ['x', 'y', 'width', 'height'].map(k => number(node, k)) as [number, number, number, number]
  const [vx, vy, vw, vh] = viewBoxOf(node)
  // MathJax's nested <svg>s show their viewBox at its own size.
  if (Math.abs(width - vw) > 0.01 || Math.abs(height - vh) > 0.01) throw new Unsupported('MathJax drew a scaled <svg>, which texel does not draw')
  const clip = STYLESHEET.unclipped.applies(at) ? here.clip : intersect(here.clip, boxThrough(here.matrix, x, y, width, height))
  return { ...here, matrix: multiply(here.matrix, [1, 0, 0, 1, x - vx, y - vy]), clip }
}

// A shape's outlines in its own units: its fill, and its stroke made an outline.
function outlinesFor(at: At, here: Context): Outline[] {
  const { node } = at
  const dash = STYLESHEET.dashed.applies(at) ? STYLESHEET.dashed : undefined
  const stroked = here.stroke && here.strokeWidth > 0
  const fill = (outline: () => Outline[]) => (here.fill ? outline() : [])
  switch (node.tag) {
    case 'path':
      if (stroked) throw new Unsupported('MathJax drew a stroked <path>, which texel does not draw')
      return fill(() => outlinesOf(node.attrs.d ?? ''))
    case 'polygon': {
      if (stroked) throw new Unsupported('MathJax drew a stroked <polygon>, which texel does not draw')
      const points = numbers(node.attrs.points, -1)
      const corners = points.flatMap((_, j) => (j % 2 ? [] : [[points[j]!, points[j + 1]!] as Point]))
      return corners.length > 2 ? fill(() => [{ start: corners[0]!, segments: corners.slice(1).map(p => [p]) }]) : []
    }
    case 'rect': {
      // A coloured background: the formula has one colour, and this would hide it.
      if ('data-bgcolor' in node.attrs) return []
      const [x, y, width, height] = ['x', 'y', 'width', 'height'].map(k => number(node, k, 0)) as [number, number, number, number]
      return [...fill(() => [rectangle(x, y, x + width, y + height)]), ...(stroked ? frame(x, y, width, height, here.strokeWidth, dash) : [])]
    }
    case 'line': {
      const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map(k => number(node, k, 0)) as [number, number, number, number]
      return stroked ? stroke([x1, y1], [x2, y2], here.strokeWidth, dash).outlines : []
    }
    default:
      return []
  }
}

// `node`'s context: its transform and paint over its parent's, by attribute,
// then MathJax's stylesheet, then its `style`, as CSS ranks them.
function paint(at: At, outer: Context): Context {
  const { node } = at
  const declared: Record<string, string> = {}
  for (const key of ['fill', 'stroke', 'stroke-width']) if (node.attrs[key] !== undefined) declared[key] = node.attrs[key]!
  if (STYLESHEET.rules.applies(at)) Object.assign(declared, { fill: 'none', 'stroke-width': String(STYLESHEET.rules.strokeWidth) })
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

// The declarations of a `style` attribute that bear on drawing; the rest
// (an \fcolorbox's CSS `border`, say, which MathJax draws itself) do not.
function declarations(style = ''): [string, string][] {
  return style
    .split(';')
    .map(declaration => declaration.split(':').map(s => s.trim()) as [string, string])
    .filter(([key]) => ['fill', 'stroke', 'stroke-width'].includes(key))
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
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? []
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
    const lettered = /[a-zA-Z]/.test(tokens[i]!)
    if (lettered) command = tokens[i++]!
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
      // Numbers after a close belong to no command.
      if (!lettered) throw new Unsupported('MathJax drew a path with numbers after Z, which texel does not read')
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
// from `phase` along the dash pattern. Returns the phase it ends at, for a
// stroke that carries on.
function stroke(a: Point, b: Point, width: number, dash: Dash | undefined, phase = 0): { outlines: Outline[]; phase: number } {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1])
  if (!length) return { outlines: [], phase }
  const at = (s: number): Point => [a[0] + ((b[0] - a[0]) * s) / length, a[1] + ((b[1] - a[1]) * s) / length]
  if (!dash) return { outlines: [bar(a, b, width)], phase }
  // An odd list of dashes repeats to make an even one, as in SVG.
  const pattern = dash.dashes.length % 2 ? [...dash.dashes, ...dash.dashes] : [...dash.dashes]
  const period = pattern.reduce((sum, d) => sum + d, 0)
  const outlines: Outline[] = []
  // Walk the pattern from the start of the period `phase` falls in.
  let s = -(phase % period)
  for (let j = 0; s < length; j = (j + 1) % pattern.length) {
    const end = s + pattern[j]!
    if (j % 2 === 0 && end > 0) outlines.push(bar(at(Math.max(0, s)), at(Math.min(length, end)), width))
    s = end
  }
  return { outlines, phase: phase + length }
}

// A bar `width` wide from `a` to `b`, its ends square.
function bar(a: Point, b: Point, width: number): Outline {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1])
  const [nx, ny] = [(-(b[1] - a[1]) / length) * (width / 2), ((b[0] - a[0]) / length) * (width / 2)]
  return { start: [a[0] + nx, a[1] + ny], segments: [[[b[0] + nx, b[1] + ny]], [[b[0] - nx, b[1] - ny]], [[a[0] - nx, a[1] - ny]]] }
}
