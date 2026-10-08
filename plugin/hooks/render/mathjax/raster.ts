// Fills MathJax's SVG into RGBA pixels. A hooks module has no canvas and no
// WebAssembly, so this is plain TypeScript, kept to what MathJax draws:
// filled paths and rects under translate/scale/matrix transforms.
//
// Curves are flattened in pixel space to within FLATNESS of the true curve,
// then filled by exact area coverage: every edge adds the signed area it
// covers in each pixel, and a running sum along each row gives coverage, as
// font-rs, stb_truetype and tiny-skia do. Opposite windings cancel (the hole
// in an `o`), equal ones clamp at full coverage: the non-zero rule.
//
// scripts/smoke.mts checks the result against resvg, pixel by pixel.

import type { SvgNode } from './vendor/mathjax-entry'

type Matrix = readonly [number, number, number, number, number, number]
type Point = readonly [number, number]

/** How far a flattened curve may stray from the true one, in pixels. */
const FLATNESS = 0.1
/** The least alpha that counts as ink when measuring: a faint fringe does not move a formula. */
const INK = 8

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

// An SVG `transform`: the translate, scale and matrix MathJax writes.
function transform(text = ''): Matrix {
  let m = IDENTITY
  for (const [, op, args = ''] of text.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const v = args.split(/[\s,]+/).filter(Boolean).map(Number)
    if (op === 'translate') m = multiply(m, [1, 0, 0, 1, v[0] ?? 0, v[1] ?? 0])
    else if (op === 'scale') m = multiply(m, [v[0] ?? 1, 0, 0, v[1] ?? v[0] ?? 1, 0, 0])
    else if (op === 'matrix' && v.length === 6) m = multiply(m, v as unknown as Matrix)
  }
  return m
}

/** A path's outlines: each a start point and line or curve segments, by their control points. */
export type Outline = { start: Point; segments: Point[][] }

/** A path's `d` as outlines, every command made absolute (arcs, which MathJax does not use, skipped). */
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
      i++
    }
  }
  if (outline) outlines.push(outline)
  return outlines.filter(o => o.segments.length > 0)
}

// Every filled outline under `node`, its control points through `m`: an
// affine map keeps a curve a curve, so flattening can wait for pixel space.
function collect(node: SvgNode, m: Matrix, out: Outline[]) {
  const here = multiply(m, transform(node.attrs.transform))
  const mapped = (o: Outline): Outline => ({ start: apply(here, o.start), segments: o.segments.map(s => s.map(p => apply(here, p))) })
  if (node.tag === 'path' && node.attrs.d) {
    out.push(...outlinesOf(node.attrs.d).map(mapped))
  } else if (node.tag === 'rect') {
    const [x, y, w, h] = ['x', 'y', 'width', 'height'].map(k => Number(node.attrs[k] ?? 0)) as [number, number, number, number]
    out.push(mapped({ start: [x, y], segments: [[[x + w, y]], [[x + w, y + h]], [[x, y + h]]] }))
  }
  for (const child of node.children) collect(child, here, out)
}

// A curve as enough points that none strays more than FLATNESS from it.
function flatten(from: Point, controls: Point[]): Point[] {
  if (controls.length === 1) return controls
  const points = [from, ...controls]
  // The largest second difference bounds how far a chord strays.
  let bend = 0
  for (let j = 0; j + 2 < points.length; j++) {
    const [a, b, c] = [points[j]!, points[j + 1]!, points[j + 2]!]
    bend = Math.max(bend, Math.hypot(a[0] - 2 * b[0] + c[0], a[1] - 2 * b[1] + c[1]))
  }
  const degree = points.length - 1
  const steps = Math.max(1, Math.ceil(Math.sqrt((degree * (degree - 1) * bend) / (8 * FLATNESS))))
  const out: Point[] = []
  for (let s = 1; s <= steps; s++) {
    const t = s / steps
    let level: Point[] = points
    while (level.length > 1) level = level.slice(1).map((p, k) => [level[k]![0] + (p[0] - level[k]![0]) * t, level[k]![1] + (p[1] - level[k]![1]) * t])
    out.push(level[0]!)
  }
  return out
}

/**
 * Pixels, RGBA row by row. `origin` is where the viewBox's top-left corner
 * lies in them (the canvas also holds ink beyond the viewBox), `baseline` the
 * baseline's row from the top, `ink` the rows and columns holding ink.
 */
export type Raster = {
  width: number
  height: number
  rgba: Uint8Array
  origin: { x: number; y: number }
  baseline: number
  ink: { top: number; bottom: number; left: number; right: number } | undefined
}

/** MathJax's `svg` filled at `pxPerEm` pixels to the em, in colour `rgb`. */
export function rasterize(svg: SvgNode, pxPerEm: number, rgb: readonly [number, number, number]): Raster {
  const [minX = 0, minY = 0, w = 0, h = 0] = (svg.attrs.viewBox ?? '').split(/\s+/).map(Number)
  const k = pxPerEm / 1000 // viewBox units are thousandths of an em
  const outlines: Outline[] = []
  collect(svg, [k, 0, 0, k, -minX * k, -minY * k], outlines)
  const polygons = outlines.map(o => [o.start, ...o.segments.flatMap((s, j) => flatten(j === 0 ? o.start : o.segments[j - 1]!.at(-1)!, s))])

  // The canvas holds the viewBox and any ink beyond it (an italic overhang),
  // with a pixel to spare, so no edge ever lands outside the buffer.
  let [x0, y0, x1, y1] = [0, 0, w * k, h * k]
  for (const p of polygons.flat()) [x0, y0, x1, y1] = [Math.min(x0, p[0]), Math.min(y0, p[1]), Math.max(x1, p[0]), Math.max(y1, p[1])]
  const [ox, oy] = [Math.floor(x0) - 1, Math.floor(y0) - 1]
  const width = Math.ceil(x1) - ox + 1
  const height = Math.ceil(y1) - oy + 1

  // Signed area per pixel, a spare cell at each row's end for the last edge's remainder.
  const stride = width + 2
  const area = new Float32Array(stride * height)
  for (const polygon of polygons) {
    polygon.forEach((p, j) => {
      const q = polygon[(j + 1) % polygon.length]!
      edge(area, stride, height, p[0] - ox, p[1] - oy, q[0] - ox, q[1] - oy)
    })
  }

  const rgba = new Uint8Array(width * height * 4)
  let ink: Raster['ink']
  for (let row = 0; row < height; row++) {
    let sum = 0
    for (let x = 0; x < width; x++) {
      sum += area[row * stride + x]!
      const alpha = Math.round(Math.min(1, Math.abs(sum)) * 255)
      if (!alpha) continue
      rgba.set([rgb[0], rgb[1], rgb[2], alpha], (row * width + x) * 4)
      if (alpha < INK) continue
      ink = ink
        ? { top: ink.top, bottom: row + 1, left: Math.min(ink.left, x), right: Math.max(ink.right, x + 1) }
        : { top: row, bottom: row + 1, left: x, right: x + 1 }
    }
  }
  return { width, height, rgba, origin: { x: -ox, y: -oy }, baseline: -minY * k - oy, ink }
}

// Adds the signed area one edge covers to every pixel it crosses, as font-rs
// does: within each row the edge is a trapezoid, split among the pixels it
// spans. Pixel coordinates; the edge lies inside the buffer.
function edge(area: Float32Array, stride: number, height: number, ax: number, ay: number, bx: number, by: number) {
  if (ay === by) return
  const dir = ay < by ? 1 : -1
  const [px0, py0, px1, py1] = dir === 1 ? [ax, ay, bx, by] : [bx, by, ax, ay]
  const dxdy = (px1 - px0) / (py1 - py0)
  let x = px0
  for (let y = Math.max(0, Math.floor(py0)); y < Math.min(height, Math.ceil(py1)); y++) {
    const row = y * stride
    const dy = Math.min(y + 1, py1) - Math.max(y, py0)
    const next = x + dxdy * dy
    const d = dy * dir
    const [lo, hi] = x < next ? [x, next] : [next, x]
    const loCell = Math.floor(lo)
    const hiCell = Math.ceil(hi)
    if (hiCell <= loCell + 1) {
      // Within one pixel: split by where the edge crosses it.
      const mid = 0.5 * (x + next) - loCell
      area[row + loCell]! += d - d * mid
      area[row + loCell + 1]! += d * mid
    } else {
      const s = 1 / (hi - lo)
      const loFrac = lo - loCell
      const first = 0.5 * s * (1 - loFrac) * (1 - loFrac)
      const hiFrac = hi - hiCell + 1
      const last = 0.5 * s * hiFrac * hiFrac
      area[row + loCell]! += d * first
      if (hiCell === loCell + 2) {
        area[row + loCell + 1]! += d * (1 - first - last)
      } else {
        const second = s * (1.5 - loFrac)
        area[row + loCell + 1]! += d * (second - first)
        for (let c = loCell + 2; c < hiCell - 1; c++) area[row + c]! += d * s
        const before = second + (hiCell - loCell - 3) * s
        area[row + hiCell - 1]! += d * (1 - before - last)
      }
      area[row + hiCell]! += d * last
    }
    x = next
  }
}
