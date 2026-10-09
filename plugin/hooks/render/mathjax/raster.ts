// Fills a drawing into RGBA pixels: outlines of lines and curves, nothing
// more. What a drawing is made from (MathJax's SVG) is drawing.ts's business.
// A hooks module has no canvas and no WebAssembly, so this is plain
// TypeScript.
//
// Curves are flattened in pixel space to within FLATNESS of the true curve,
// then filled by exact area coverage: every edge adds the signed area it
// covers in each pixel, and a running sum along each row gives coverage, as
// font-rs, stb_truetype and tiny-skia do. Within a shape, opposite windings
// cancel (the hole in an `o`) and equal ones clamp at full coverage: the
// non-zero rule. Shapes are laid one over another, as SVG paints elements.
//
// scripts/smoke.mts checks the result against resvg, pixel by pixel.

export type Point = readonly [number, number]

/** An axis-aligned box. */
export type Box = { left: number; top: number; right: number; bottom: number }

/** A closed outline: a start point and line or curve segments, each by its control points and end. */
export type Outline = { start: Point; segments: Point[][] }

/** Outlines filled as one, by the non-zero rule, and the box they are clipped to. */
export type Shape = { outlines: Outline[]; clip?: Box }

/** Shapes in a viewBox whose units are thousandths of an em, painted in order. */
export type Drawing = { viewBox: Box; shapes: Shape[] }

/**
 * Pixels, RGBA row by row. `origin` is where the viewBox's top-left corner
 * lies in them (the canvas also holds ink beyond the viewBox), `baseline` the
 * baseline's row from the top (y = 0), `ink` the rows and columns holding ink.
 */
export type Raster = {
  width: number
  height: number
  rgba: Uint8Array
  origin: { x: number; y: number }
  baseline: number
  ink: Box | undefined
}

/** How far a flattened curve may stray from the true one, in pixels. */
const FLATNESS = 0.1
/** The least alpha that counts as ink when measuring: a faint fringe does not move a formula. */
const INK = 8

/** `drawing` filled at `pxPerEm` pixels to the em, in colour `rgb`. */
export function rasterize({ viewBox, shapes }: Drawing, pxPerEm: number, rgb: readonly [number, number, number]): Raster {
  const k = pxPerEm / 1000
  const toPixels = ([x, y]: Point): Point => [(x - viewBox.left) * k, (y - viewBox.top) * k]
  const filled = shapes.map(({ outlines, clip }) => {
    const polygons = outlines.map(o => polygonOf(o, toPixels))
    if (!clip) return polygons
    const [a, b] = [toPixels([clip.left, clip.top]), toPixels([clip.right, clip.bottom])]
    return polygons.map(p => clipped(p, { left: a[0], top: a[1], right: b[0], bottom: b[1] })).filter(p => p.length > 2)
  })

  // The canvas holds the viewBox and any ink beyond it (an italic overhang),
  // with a pixel to spare, so no edge ever lands outside the buffer.
  const bounds = boundsOf(filled.flat(2), { left: 0, top: 0, right: (viewBox.right - viewBox.left) * k, bottom: (viewBox.bottom - viewBox.top) * k })
  const [ox, oy] = [Math.floor(bounds.left) - 1, Math.floor(bounds.top) - 1]
  const width = Math.ceil(bounds.right) - ox + 1
  const height = Math.ceil(bounds.bottom) - oy + 1

  // Signed area per pixel, a spare cell at each row's end for an edge's remainder;
  // each shape's is swept into `alpha` and cleared before the next.
  const stride = width + 2
  const area = new Float32Array(stride * height)
  const alpha = new Float32Array(width * height)
  for (const polygons of filled) {
    if (!polygons.length) continue
    for (const polygon of polygons) {
      polygon.forEach((p, j) => {
        const q = polygon[(j + 1) % polygon.length]!
        edge(area, stride, p[0] - ox, p[1] - oy, q[0] - ox, q[1] - oy)
      })
    }
    const box = boundsOf(polygons.flat())
    for (let row = Math.floor(box.top) - oy; row < Math.ceil(box.bottom) - oy; row++) {
      let sum = 0
      for (let x = Math.floor(box.left) - ox; x < Math.min(stride, Math.ceil(box.right) - ox + 2); x++) {
        sum += area[row * stride + x]!
        area[row * stride + x] = 0
        const cover = Math.min(1, Math.abs(sum))
        if (cover && x < width) alpha[row * width + x]! += cover * (1 - alpha[row * width + x]!)
      }
    }
  }

  const rgba = new Uint8Array(width * height * 4)
  let ink: Box | undefined
  for (let row = 0; row < height; row++) {
    for (let x = 0; x < width; x++) {
      const a = Math.round(alpha[row * width + x]! * 255)
      if (!a) continue
      rgba.set([rgb[0], rgb[1], rgb[2], a], (row * width + x) * 4)
      if (a < INK) continue
      ink = ink
        ? { top: ink.top, bottom: row + 1, left: Math.min(ink.left, x), right: Math.max(ink.right, x + 1) }
        : { top: row, bottom: row + 1, left: x, right: x + 1 }
    }
  }
  return { width, height, rgba, origin: { x: -ox, y: -oy }, baseline: -viewBox.top * k - oy, ink }
}

// The box around `points`, and around `start` if given.
function boundsOf(points: Point[], start?: Box): Box {
  let [left, top, right, bottom] = start ? [start.left, start.top, start.right, start.bottom] : [Infinity, Infinity, -Infinity, -Infinity]
  for (const [x, y] of points) [left, top, right, bottom] = [Math.min(left, x), Math.min(top, y), Math.max(right, x), Math.max(bottom, y)]
  return { left, top, right, bottom }
}

// An outline as a polygon in pixels: mapped by `map` (affine, so a curve's
// control points map to the mapped curve's), then flattened.
function polygonOf({ start, segments }: Outline, map: (p: Point) => Point): Point[] {
  const polygon = [map(start)]
  for (const segment of segments) polygon.push(...flatten(polygon.at(-1)!, segment.map(map)))
  return polygon
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

// `polygon` cut to `box`, one side at a time (Sutherland-Hodgman). A concave
// polygon may come out with edges doubled back along the box; their areas
// cancel, so it fills the same.
function clipped(polygon: Point[], box: Box): Point[] {
  const sides: [axis: 0 | 1, bound: number, keep: 1 | -1][] = [[0, box.left, 1], [0, box.right, -1], [1, box.top, 1], [1, box.bottom, -1]]
  let out = polygon
  for (const [axis, bound, keep] of sides) {
    const inside = (p: Point) => (p[axis] - bound) * keep >= 0
    const input = out
    out = []
    input.forEach((p, j) => {
      const q = input[(j + 1) % input.length]!
      if (inside(p)) out.push(p)
      if (inside(p) !== inside(q)) {
        const t = (bound - p[axis]) / (q[axis] - p[axis])
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t])
      }
    })
  }
  return out
}

// Adds the signed area one edge covers to every pixel it crosses, as font-rs
// does: within each row the edge is a trapezoid, split among the pixels it
// spans. Pixel coordinates; the edge lies inside the buffer.
function edge(area: Float32Array, stride: number, ax: number, ay: number, bx: number, by: number) {
  if (ay === by) return
  const dir = ay < by ? 1 : -1
  const [px0, py0, px1, py1] = dir === 1 ? [ax, ay, bx, by] : [bx, by, ax, ay]
  const dxdy = (px1 - px0) / (py1 - py0)
  let x = px0
  for (let y = Math.floor(py0); y < Math.ceil(py1); y++) {
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
