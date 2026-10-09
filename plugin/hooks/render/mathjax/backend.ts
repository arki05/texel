// LaTeX rendered inside the hooks module: MathJax's TeX to SVG, read as a
// drawing (drawing.ts), filled into pixels (raster.ts), placed on the
// terminal's grid. Nothing to install and nothing to wait for, so it answers
// every draw directly.

import { blockCells, PX_PER_PT, type Grid, type Ink } from '../../layout/geometry'
import { toBase64 } from '../base64'
import type { LatexJob, MathBackend } from '../renderer'
import { isFailure, tooLarge, type Rendered, type RenderFailure } from '../result'
import { drawingOf } from './drawing'
import { rasterize, type Drawing, type Raster } from './raster'
import { createTex, type Tex } from './vendor/mathjax-entry.js'

/** How LaTeX is set: on which grid, in what colour (six hex digits), at what inline size, with which macros. */
export type MathStyle = { grid: Grid; color: string; inlineScale: number; macros: string }

/** The x-height of MathJax's TeX font, in em: math is sized so it matches the terminal's. */
const X_HEIGHT = 0.442
/** The most pixels an Image takes, as RGBA bytes. */
export const MAX_BYTES = 2 * 1024 * 1024

type Result = Ink | Rendered | RenderFailure

/**
 * What MathJax keeps between draws, for as long as the module is loaded: the
 * TeX for the macros in use, and what it has made, the least recently used
 * let go past `maxBytes`. New macros start it afresh, as everything made
 * with the old ones is stale.
 */
export class MathCache {
  private current: { macros: string; tex: Tex } | undefined
  private readonly results = new Map<string, { result: Result; bytes: number }>()
  private bytes = 0

  constructor(private readonly maxBytes = 64 * 1024 * 1024) {}

  /** The TeX that knows `macros`. */
  tex(macros: string): Tex {
    if (this.current?.macros !== macros) {
      this.current = { macros, tex: createTex(macros) }
      this.results.clear()
      this.bytes = 0
    }
    return this.current.tex
  }

  get(key: string): Result | undefined {
    const entry = this.results.get(key)
    if (!entry) return undefined
    // Used again: last to go.
    this.results.delete(key)
    this.results.set(key, entry)
    return entry.result
  }

  set(key: string, result: Result) {
    // A picture is its pixels, base64 in a string of two-byte characters; anything else is small.
    const bytes = 2 * key.length + ('picture' in result && 'rgba' in result.picture ? 2 * result.picture.rgba.length : 256)
    this.results.set(key, { result, bytes })
    this.bytes += bytes
    for (const [oldest, entry] of this.results) {
      if (this.bytes <= this.maxBytes || oldest === key) break
      this.results.delete(oldest)
      this.bytes -= entry.bytes
    }
  }

  /** How many results it holds. */
  get size() {
    return this.results.size
  }
}

const rgbOf = (hex: string) => [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]

type Inked = Raster & { ink: NonNullable<Raster['ink']> }

// The formula as a drawing, or why it cannot be one.
function drawingFor(tex: Tex, source: string, display: boolean): Drawing | RenderFailure {
  const svg = tex.convert(source, display)
  return 'error' in svg ? svg : drawingOf(svg)
}

// The drawing's viewBox, in points at `em` points to the em.
const sizeOf = ({ viewBox }: Drawing, em: number) => [((viewBox.right - viewBox.left) * em) / 1000, ((viewBox.bottom - viewBox.top) * em) / 1000] as const

// The drawing filled at `pxPerEm`, or why it cannot be.
function fill(drawing: Drawing, pxPerEm: number, color: string): Inked | RenderFailure {
  const raster = rasterize(drawing, pxPerEm, rgbOf(color))
  if (isFailure(raster)) return raster
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
  // What results are known by besides their job: the style, but for the
  // macros, which the cache's TeX already stands for.
  const { macros: _, ...styled } = style
  const styleKey = JSON.stringify(styled)
  // The em, in points: x-height matched to the terminal's, times `scale`.
  const em = (scale: number) => (scale * grid.xHeight) / X_HEIGHT

  // Pixels per point for a picture `width` x `height` points: full resolution,
  // or less for one that would not fit an Image. Rounded down, as `pixels` is,
  // the picture is never over.
  const resolution = (width: number, height: number) =>
    Math.min(PX_PER_PT, Math.sqrt(MAX_BYTES / 4 / Math.max(1, width * height)))
  const pixels = (points: number, k: number) => Math.max(1, Math.floor(points * k))

  // What `make` makes for `key`, made once. Whatever it throws is a failure
  // of this formula alone, not of the message it is in.
  function remembered<T extends Result>(key: unknown, make: () => T | RenderFailure): T | RenderFailure {
    const id = `${JSON.stringify(key)} ${styleKey}`
    const known = cache.get(id) as T | RenderFailure | undefined
    if (known) return known
    let made: T | RenderFailure
    try {
      made = make()
    } catch (e) {
      made = { error: `texel failed: ${e instanceof Error ? e.message : String(e)}` }
    }
    cache.set(id, made)
    return made
  }

  // A picture of `columns` x `rows` cells, the ink placed by `at` (in pixels, given the picture's size).
  function picture(columns: number, rows: number, draw: (k: number) => Inked | RenderFailure, at: (r: Inked, w: number, h: number, k: number) => [number, number]): Rendered | RenderFailure {
    const refused = tooLarge(columns, rows)
    if (refused) return refused
    const k = resolution(columns * grid.cellWidth, rows * grid.cellHeight)
    const raster = draw(k)
    if (isFailure(raster)) return raster
    const width = pixels(columns * grid.cellWidth, k)
    const height = pixels(rows * grid.cellHeight, k)
    const [x, y] = at(raster, width, height, k)
    return { picture: { rgba: toBase64(place(raster, width, height, x, y)), width, height }, columns, rows }
  }

  // The ink's width and height in points, filled at `k` pixels per point.
  const extent = (r: Inked, k: number) => [(r.ink.right - r.ink.left) / k, (r.ink.bottom - r.ink.top) / k] as const

  return {
    async ink(source) {
      return remembered(['ink', source], () => {
        const drawing = drawingFor(tex, source, false)
        if (isFailure(drawing)) return drawing
        // Too large for any line: refused before it is filled.
        const [w, h] = sizeOf(drawing, em(style.inlineScale))
        const refused = tooLarge(Math.ceil(w / grid.cellWidth), Math.ceil(h / grid.cellHeight))
        if (refused) return refused
        const r = fill(drawing, em(style.inlineScale) * PX_PER_PT, style.color)
        if (isFailure(r)) return r
        const [width] = extent(r, PX_PER_PT)
        return { width, above: (r.baseline - r.ink.top) / PX_PER_PT, below: (r.ink.bottom - r.baseline) / PX_PER_PT }
      })
    },

    async picture(job: LatexJob) {
      return remembered(job, () => {
        const drawing = drawingFor(tex, job.tex, job.kind === 'display')
        if (isFailure(drawing)) return drawing
        if (job.kind === 'inline') {
          const { columns, rows, scale, dy } = job.placement
          // As fitted: `scale` of its natural size, centred across its box, its ink `dy` points down.
          return picture(
            columns,
            rows,
            k => fill(drawing, em(style.inlineScale) * scale * k, style.color),
            (r, w, _, k) => [Math.round((w - (r.ink.right - r.ink.left)) / 2), Math.round(dy * k)],
          )
        }
        // On its own, at its natural size, centred in whole cells with room
        // around it. The viewBox tells its size near enough to refuse one too
        // large, and to choose the resolution, before it is filled.
        const guess = blockCells(grid, ...sizeOf(drawing, em(1)))
        const refused = tooLarge(guess.columns, guess.rows)
        if (refused) return refused
        const at = resolution(guess.columns * grid.cellWidth, guess.rows * grid.cellHeight)
        const natural = fill(drawing, em(1) * at, style.color)
        if (isFailure(natural)) return natural
        const { columns, rows } = blockCells(grid, ...extent(natural, at))
        return picture(
          columns,
          rows,
          k => (k === at ? natural : fill(drawing, em(1) * k, style.color)),
          (r, w, h) => [Math.round((w - (r.ink.right - r.ink.left)) / 2), Math.round((h - (r.ink.bottom - r.ink.top)) / 2)],
        )
      })
    },
  }
}
