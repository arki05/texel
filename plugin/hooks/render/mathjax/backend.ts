// LaTeX rendered inside the hooks module: MathJax's TeX to SVG, filled into
// pixels (raster.ts), placed on the terminal's grid. Nothing to install and
// nothing to wait for, so it answers every draw directly.

import type { Grid, Ink } from '../../layout/geometry'
import { toBase64 } from '../base64'
import type { LatexJob, MathBackend } from '../renderer'
import { isFailure, type Rendered, type RenderFailure } from '../result'
import { rasterize, type Raster } from './raster'
import { createTex, type Tex } from './vendor/mathjax-entry.js'

/** How LaTeX is set: on which grid, in what colour (six hex digits), at what inline size, with which macros. */
export type MathStyle = { grid: Grid; color: string; inlineScale: number; macros: string }

/** The x-height of MathJax's TeX font, in em: math is sized so it matches the terminal's. */
const X_HEIGHT = 0.442
/** Pixels per point at full resolution: 216 ppi. */
const PX_PER_PT = 3
/** The most pixels an Image takes, as RGBA bytes. */
const MAX_BYTES = 2 * 1024 * 1024
/** The most cells an Image covers, each way. */
const MAX_CELLS = 255

/** What MathJax keeps between draws, for as long as the module is loaded. */
export class MathCache {
  private readonly texes = new Map<string, Tex>()
  readonly results = new Map<string, Ink | Rendered | RenderFailure>()

  /** The TeX that knows `macros`: one per macros text, as definitions persist in it. */
  tex(macros: string): Tex {
    let tex = this.texes.get(macros)
    if (!tex) this.texes.set(macros, (tex = createTex(macros)))
    return tex
  }
}

const rgbOf = (hex: string) => [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]

type Inked = Raster & { ink: NonNullable<Raster['ink']> }

// The formula filled at `pxPerEm`, or why it cannot be.
function fill(tex: Tex, source: string, display: boolean, pxPerEm: number, color: string): Inked | RenderFailure {
  const svg = tex.convert(source, display)
  if ('error' in svg) return { error: svg.error }
  const raster = rasterize(svg, pxPerEm, rgbOf(color))
  return raster.ink ? (raster as Inked) : { error: 'the formula draws nothing' }
}

// `raster`'s ink copied into a fresh `width` x `height` picture, its top-left at (`x`, `y`).
function place(raster: Inked, width: number, height: number, x: number, y: number): Uint8Array {
  const out = new Uint8Array(width * height * 4)
  const { top, bottom, left, right } = raster.ink
  for (let row = top; row < bottom; row++) {
    const to = y + row - top
    if (to < 0 || to >= height) continue
    for (let col = left; col < right; col++) {
      const at = x + col - left
      if (at < 0 || at >= width) continue
      out.set(raster.rgba.subarray((row * raster.width + col) * 4, (row * raster.width + col) * 4 + 4), (to * width + at) * 4)
    }
  }
  return out
}

export function createMathBackend(cache: MathCache, style: MathStyle): MathBackend {
  const { grid } = style
  const tex = cache.tex(style.macros)
  // The em, in points: x-height matched to the terminal's, times `scale`.
  const em = (scale: number) => (scale * grid.xHeight) / X_HEIGHT

  // Pixels per point for a picture `width` x `height` points: full resolution,
  // or less for one that would not fit an Image.
  const resolution = (width: number, height: number) =>
    Math.min(PX_PER_PT, Math.sqrt(MAX_BYTES / 4 / Math.max(1, width * height)))

  function remembered<T extends Ink | Rendered | RenderFailure>(key: unknown[], make: () => T): T {
    const id = JSON.stringify(key)
    const known = cache.results.get(id) as T | undefined
    if (known) return known
    const made = make()
    cache.results.set(id, made)
    return made
  }

  // A picture of `columns` x `rows` cells, the ink placed by `at` (in pixels, given the picture's size).
  function picture(columns: number, rows: number, draw: (k: number) => Inked | RenderFailure, at: (r: Inked, w: number, h: number, k: number) => [number, number]): Rendered | RenderFailure {
    if (columns > MAX_CELLS || rows > MAX_CELLS) {
      return { error: `too large to show: ${columns} x ${rows} cells (an image holds ${MAX_CELLS} x ${MAX_CELLS})` }
    }
    const k = resolution(columns * grid.cellWidth, rows * grid.cellHeight)
    const raster = draw(k)
    if (isFailure(raster)) return raster
    const width = Math.max(1, Math.round(columns * grid.cellWidth * k))
    const height = Math.max(1, Math.round(rows * grid.cellHeight * k))
    const [x, y] = at(raster, width, height, k)
    return { picture: { rgba: toBase64(place(raster, width, height, x, y)), width, height }, columns, rows }
  }

  // The ink's width and height in points, at full resolution.
  const extent = (r: Inked) => [(r.ink.right - r.ink.left) / PX_PER_PT, (r.ink.bottom - r.ink.top) / PX_PER_PT] as const

  return {
    async ink(source) {
      return remembered(['ink', source, style.macros, grid, style.inlineScale], () => {
        const r = fill(tex, source, false, em(style.inlineScale) * PX_PER_PT, style.color)
        if (isFailure(r)) return r
        const [width] = extent(r)
        return { width, above: (r.baseline - r.ink.top) / PX_PER_PT, below: (r.ink.bottom - r.baseline) / PX_PER_PT }
      })
    },

    async picture(job: LatexJob) {
      return remembered([job, style], () => {
        if (job.kind === 'inline') {
          const { columns, rows, scale, dy } = job.placement
          // As fitted: `scale` of its natural size, centred across its box, its ink `dy` points down.
          return picture(
            columns,
            rows,
            k => fill(tex, job.tex, false, em(style.inlineScale) * scale * k, style.color),
            (r, w, _, k) => [Math.round((w - (r.ink.right - r.ink.left)) / 2), Math.round(dy * k)],
          )
        }
        // On its own, at its natural size, centred in whole cells with room around it.
        const natural = fill(tex, job.tex, true, em(1) * PX_PER_PT, style.color)
        if (isFailure(natural)) return natural
        const [width, height] = extent(natural)
        const columns = Math.max(1, Math.ceil((width + grid.cellWidth) / grid.cellWidth))
        const rows = Math.max(1, Math.ceil((height + grid.cellHeight * 0.5) / grid.cellHeight))
        return picture(
          columns,
          rows,
          k => (k === PX_PER_PT ? natural : fill(tex, job.tex, true, em(1) * k, style.color)),
          (r, w, h) => [Math.round((w - (r.ink.right - r.ink.left)) / 2), Math.round((h - (r.ink.bottom - r.ink.top)) / 2)],
        )
      })
    },
  }
}
