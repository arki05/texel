// Fills MathJax's SVG (paths and rects under transforms) into RGBA pixels,
// anti-aliased by 4x4 supersampling with the non-zero winding rule. A hooks
// module has no canvas and no WebAssembly, so this is plain TypeScript.

import type { SvgNode } from './vendor/mathjax-entry'

type Matrix = readonly [number, number, number, number, number, number]
type Point = readonly [number, number]
type Edge = { x0: number; y0: number; x1: number; y1: number; dir: 1 | -1 }

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]
/** Samples per pixel along each axis. */
const SS = 4

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

// A curve flattened into `steps` points after `from`.
function bezier(points: readonly Point[], steps: number): Point[] {
  const out: Point[] = []
  for (let s = 1; s <= steps; s++) {
    const t = s / steps
    let level = points
    while (level.length > 1) level = level.slice(1).map((p, i) => [level[i]![0] + (p[0] - level[i]![0]) * t, level[i]![1] + (p[1] - level[i]![1]) * t])
    out.push(level[0]!)
  }
  return out
}

/** A path's `d` as closed polygons, its curves flattened. */
export function polygons(d: string): Point[][] {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? []
  const polys: Point[][] = []
  let poly: Point[] = []
  let cur: Point = [0, 0]
  let start: Point = [0, 0]
  let control: Point | undefined
  let command = ''
  let i = 0
  const num = () => Number(tokens[i++])
  const close = () => {
    if (poly.length > 2) polys.push(poly)
  }
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i]!)) command = tokens[i++]!
    const relative = command === command.toLowerCase()
    const at = (x: number, y: number): Point => (relative ? [cur[0] + x, cur[1] + y] : [x, y])
    const mirrored = (): Point => (control ? [2 * cur[0] - control[0], 2 * cur[1] - control[1]] : cur)
    switch (command.toUpperCase()) {
      case 'M':
        close()
        cur = start = at(num(), num())
        poly = [cur]
        command = relative ? 'l' : 'L' // further pairs are lines
        control = undefined
        break
      case 'L':
        cur = at(num(), num())
        poly.push(cur)
        control = undefined
        break
      case 'H':
        cur = [relative ? cur[0] + num() : num(), cur[1]]
        poly.push(cur)
        control = undefined
        break
      case 'V':
        cur = [cur[0], relative ? cur[1] + num() : num()]
        poly.push(cur)
        control = undefined
        break
      case 'Q':
      case 'T': {
        const c = command.toUpperCase() === 'Q' ? at(num(), num()) : mirrored()
        const p = at(num(), num())
        poly.push(...bezier([cur, c, p], 8))
        control = c
        cur = p
        break
      }
      case 'C':
      case 'S': {
        const c1 = command.toUpperCase() === 'C' ? at(num(), num()) : mirrored()
        const c2 = at(num(), num())
        const p = at(num(), num())
        poly.push(...bezier([cur, c1, c2, p], 12))
        control = c2
        cur = p
        break
      }
      case 'Z':
        close()
        cur = start
        poly = [cur]
        control = undefined
        break
      default:
        i++ // arcs, which MathJax's glyphs do not use, and anything unknown
    }
  }
  close()
  return polys
}

// Every filled outline under `node`, through `m`.
function outlines(node: SvgNode, m: Matrix, out: Point[][]) {
  const here = multiply(m, transform(node.attrs.transform))
  if (node.tag === 'path' && node.attrs.d) {
    for (const poly of polygons(node.attrs.d)) out.push(poly.map(p => apply(here, p)))
  } else if (node.tag === 'rect') {
    const [x, y, w, h] = ['x', 'y', 'width', 'height'].map(k => Number(node.attrs[k] ?? 0)) as [number, number, number, number]
    const corners: Point[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
    out.push(corners.map(p => apply(here, p)))
  }
  for (const child of node.children) outlines(child, here, out)
}

/** Pixels, RGBA row by row; `baseline` is the baseline's row from the top, `ink` the rows and columns holding ink. */
export type Raster = {
  width: number
  height: number
  rgba: Uint8Array
  baseline: number
  ink: { top: number; bottom: number; left: number; right: number } | undefined
}

/** MathJax's `svg` filled at `pxPerEm` pixels to the em, in colour `rgb`. */
export function rasterize(svg: SvgNode, pxPerEm: number, rgb: readonly [number, number, number]): Raster {
  const [minX = 0, minY = 0, w = 0, h = 0] = (svg.attrs.viewBox ?? '').split(/\s+/).map(Number)
  const k = pxPerEm / 1000 // viewBox units are thousandths of an em
  const width = Math.max(1, Math.ceil(w * k))
  const height = Math.max(1, Math.ceil(h * k))
  const polys: Point[][] = []
  outlines(svg, [k * SS, 0, 0, k * SS, -minX * k * SS, -minY * k * SS], polys)

  const edges: Edge[] = []
  for (const poly of polys) {
    poly.forEach((a, j) => {
      const b = poly[(j + 1) % poly.length]!
      if (a[1] === b[1]) return
      edges.push(a[1] < b[1] ? { x0: a[0], y0: a[1], x1: b[0], y1: b[1], dir: 1 } : { x0: b[0], y0: b[1], x1: a[0], y1: a[1], dir: -1 })
    })
  }

  const rgba = new Uint8Array(width * height * 4)
  const coverage = new Uint16Array(width)
  const samples = width * SS
  const crossings: { x: number; dir: number }[] = []
  let ink: Raster['ink']
  for (let row = 0; row < height; row++) {
    coverage.fill(0)
    for (let sub = 0; sub < SS; sub++) {
      const y = row * SS + sub + 0.5
      crossings.length = 0
      for (const e of edges) {
        if (y >= e.y0 && y < e.y1) crossings.push({ x: e.x0 + ((y - e.y0) / (e.y1 - e.y0)) * (e.x1 - e.x0), dir: e.dir })
      }
      crossings.sort((p, q) => p.x - q.x)
      let winding = 0
      for (let c = 0; c < crossings.length - 1; c++) {
        winding += crossings[c]!.dir
        if (winding === 0) continue
        const from = Math.max(0, Math.ceil(crossings[c]!.x - 0.5))
        const to = Math.min(samples, Math.ceil(crossings[c + 1]!.x - 0.5))
        for (let s = from; s < to; s++) coverage[(s / SS) | 0]!++
      }
    }
    for (let x = 0; x < width; x++) {
      const alpha = Math.min(255, Math.round((coverage[x]! * 255) / (SS * SS)))
      if (!alpha) continue
      rgba.set([rgb[0], rgb[1], rgb[2], alpha], (row * width + x) * 4)
      ink = ink
        ? { top: ink.top, bottom: row + 1, left: Math.min(ink.left, x), right: Math.max(ink.right, x + 1) }
        : { top: row, bottom: row + 1, left: x, right: x + 1 }
    }
  }
  return { width, height, rgba, baseline: -minY * k, ink }
}
