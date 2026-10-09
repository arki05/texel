// LaTeX rendered inside the hooks module: MathJax's TeX to SVG, read as a
// drawing (drawing.ts), filled into pixels (raster.ts), placed on the
// terminal's grid. Nothing to install and nothing to wait for, so it answers
// every draw directly.

import { blockCells, PX_PER_PT, type Grid, type Ink } from '../../layout/geometry'
import { toBase64 } from '../base64'
import { encodePng } from '../png'
import type { LatexJob, MathBackend } from '../renderer'
import { isFailure, tooLarge, type Rendered, type RenderFailure } from '../result'
import { drawingOf } from './drawing'
import { rasterize, type Box, type Raster } from './raster'
import { createTex, type Tex } from './vendor/mathjax-entry.js'

/** How LaTeX is set: on which grid, in what colour (six hex digits), at what inline size, with which macros. */
export type MathStyle = { grid: Grid; color: string; inlineScale: number; macros: string }

/** The x-height of MathJax's TeX font, in em: math is sized so it matches the terminal's. */
const X_HEIGHT = 0.442

type Result = Ink | Rendered | RenderFailure

/**
 * What MathJax keeps between draws, for as long as the module is loaded: the
 * TeX for the macros in use, and what it has made, the least recently used
 * let go past `maxResults`. New macros start it afresh, as everything made
 * with the old ones is stale.
 */
export class MathCache {
  private current: { macros: string; tex: Tex } | undefined
  private readonly results = new Map<string, Result>()

  constructor(private readonly maxResults = 1000) {}

  /** The TeX that knows `macros`. */
  tex(macros: string): Tex {
    if (this.current?.macros !== macros) {
      this.current = { macros, tex: createTex(macros) }
      this.results.clear()
    }
    return this.current.tex
  }

  get(key: string): Result | undefined {
    const result = this.results.get(key)
    if (result === undefined) return undefined
    // Used again: last to go.
    this.results.delete(key)
    this.results.set(key, result)
    return result
  }

  set(key: string, result: Result) {
    this.results.set(key, result)
    if (this.results.size > this.maxResults) this.results.delete(this.results.keys().next().value!)
  }

  /** How many results it holds. */
  get size() {
    return this.results.size
  }
}

const rgbOf = (hex: string) => [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]

type Inked = Raster & { ink: Box }

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

  function remembered<T extends Result>(key: unknown, make: () => T | RenderFailure): T | RenderFailure {
    const id = `${JSON.stringify(key)} ${styleKey}`
    const known = cache.get(id) as T | RenderFailure | undefined
    if (known) return known
    const made = make()
    cache.set(id, made)
    return made
  }

  // The formula filled at `scale` (1: its x-height the text's), or why it
  // cannot be. One whose viewBox is already beyond a picture is refused
  // before a pixel is made.
  function inked(source: string, display: boolean, scale: number): Inked | RenderFailure {
    const svg = tex.convert(source, display)
    if ('error' in svg) return svg
    const drawing = drawingOf(svg)
    if (isFailure(drawing)) return drawing
    const { left, top, right, bottom } = drawing.viewBox
    const points = em(scale) / 1000
    const refused = tooLarge(Math.ceil(((right - left) * points) / grid.cellWidth), Math.ceil(((bottom - top) * points) / grid.cellHeight))
    if (refused) return refused
    const raster = rasterize(drawing, em(scale) * PX_PER_PT, rgbOf(style.color))
    return raster.ink ? (raster as Inked) : { error: 'the formula draws nothing' }
  }

  // `raster`'s ink as a PNG of `columns` x `rows` cells: against `side` or
  // centred across, and `y` pixels down or, without, centred down too.
  function picture(raster: Inked, columns: number, rows: number, y?: number, side?: 'left' | 'right'): Rendered | RenderFailure {
    const refused = tooLarge(columns, rows)
    if (refused) return refused
    const width = Math.round(columns * grid.cellWidth * PX_PER_PT)
    const height = Math.round(rows * grid.cellHeight * PX_PER_PT)
    const { top, bottom, left, right } = raster.ink
    const slack = width - (right - left)
    const x = side === 'left' ? 0 : side === 'right' ? slack : Math.round(slack / 2)
    const pixels = place(raster, width, height, x, y ?? Math.round((height - (bottom - top)) / 2))
    return { picture: { png: toBase64(encodePng(pixels, width, height)) }, columns, rows }
  }

  return {
    async ink(source) {
      return remembered(['ink', source], () => {
        const r = inked(source, false, style.inlineScale)
        if (isFailure(r)) return r
        return { width: (r.ink.right - r.ink.left) / PX_PER_PT, above: (r.baseline - r.ink.top) / PX_PER_PT, below: (r.ink.bottom - r.baseline) / PX_PER_PT }
      })
    },

    async picture(job: LatexJob) {
      return remembered(job, () => {
        if (job.kind === 'inline') {
          // As fitted: `scale` of its natural size, its ink `dy` points down its box.
          const { columns, rows, scale, dy, side } = job.placement
          const r = inked(job.tex, false, style.inlineScale * scale)
          return isFailure(r) ? r : picture(r, columns, rows, Math.round(dy * PX_PER_PT), side)
        }
        // On its own, at its natural size, in whole cells with room around it.
        const r = inked(job.tex, true, 1)
        if (isFailure(r)) return r
        const { columns, rows } = blockCells(grid, (r.ink.right - r.ink.left) / PX_PER_PT, (r.ink.bottom - r.ink.top) / PX_PER_PT)
        return picture(r, columns, rows)
      })
    },
  }
}
