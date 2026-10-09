// LaTeX rendered inside the hooks module: MathJax's TeX to SVG, read as a
// drawing (drawing.ts), filled into pixels (raster.ts), placed on the
// terminal's grid. Nothing to install and nothing to wait for, so it answers
// every draw directly.

import { blockCells, MIN_READABLE, PX_PER_PT, type Grid, type Ink } from '../../geometry'
import { toBase64 } from '../base64'
import { encodePng } from '../png'
import type { BlockRenderer, InlineRenderer, Side } from '../renderer'
import { isFailure, TOO_WIDE, tooLarge, type Rendered, type RenderFailure } from '../result'
import { accented } from './accents'
import { drawingOf } from './drawing'
import { rasterize, type Box, type Drawing, type Raster } from './raster'
import { createTex, type Tex } from './vendor/mathjax-entry.js'

/** How LaTeX is set: on which grid, in what colour (six hex digits), at what inline size, with which macros. */
export type MathStyle = { grid: Grid; color: string; inlineSize: number; macros: string }

/** The x-height of MathJax's TeX font, in em: math is sized so it matches the terminal's. */
const X_HEIGHT = 0.442

type Result = Ink | Rendered | RenderFailure

/** LaTeX inline, and on its own as a block: both answered at once. */
export type MathBackend = InlineRenderer & { block: BlockRenderer }

/** A map that lets the least recently used entry go past `max` entries. */
class Lru<V> {
  private readonly entries = new Map<string, V>()

  constructor(private readonly max: number) {}

  get(key: string): V | undefined {
    const value = this.entries.get(key)
    if (value === undefined) return undefined
    // Used again: last to go.
    this.entries.delete(key)
    this.entries.set(key, value)
    return value
  }

  set(key: string, value: V) {
    this.entries.set(key, value)
    if (this.entries.size > this.max) this.entries.delete(this.entries.keys().next().value!)
  }

  clear() {
    this.entries.clear()
  }

  /** How many entries it holds. */
  count() {
    return this.entries.size
  }
}

/**
 * What MathJax keeps between draws, for as long as the module is loaded: the
 * TeX for the macros in use; each formula's drawing, which holds for any
 * size and colour, so measuring and drawing it convert it once; and the
 * results made from them. New macros start it afresh, as everything made
 * with the old ones is stale.
 */
export class MathCache {
  private current: { macros: string; tex: Tex } | undefined
  readonly drawings: Lru<Drawing | RenderFailure>
  readonly results: Lru<Result>

  constructor(maxResults = 1000) {
    this.drawings = new Lru(maxResults)
    this.results = new Lru(maxResults)
  }

  /** The TeX that knows `macros`. */
  tex(macros: string): Tex {
    if (this.current?.macros !== macros) {
      this.current = { macros, tex: createTex(accented(macros)) }
      this.drawings.clear()
      this.results.clear()
    }
    return this.current.tex
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
    const known = cache.results.get(id) as T | RenderFailure | undefined
    if (known) return known
    const made = make()
    cache.results.set(id, made)
    return made
  }

  // The formula as MathJax draws it, converted once whatever its size and colour.
  function drawingFor(source: string, display: boolean): Drawing | RenderFailure {
    const key = `${display ? 'display' : 'inline'} ${source}`
    const known = cache.drawings.get(key)
    if (known) return known
    const svg = tex.convert(accented(source), display)
    const drawing = 'error' in svg ? svg : drawingOf(svg)
    cache.drawings.set(key, drawing)
    return drawing
  }

  // The formula filled at `scale` (1: its x-height the text's), or why it
  // cannot be. One whose viewBox is already beyond a picture is refused
  // before a pixel is made.
  function inked(source: string, display: boolean, scale: number): Inked | RenderFailure {
    const drawing = drawingFor(source, display)
    if (isFailure(drawing)) return drawing
    const { left, top, right, bottom } = drawing.viewBox
    const points = em(scale) / 1000
    const refused = tooLarge(Math.ceil(((right - left) * points) / grid.cellWidth), Math.ceil(((bottom - top) * points) / grid.cellHeight))
    if (refused) return refused
    const raster = rasterize(drawing, em(scale) * PX_PER_PT, rgbOf(style.color))
    return raster.ink ? (raster as Inked) : { error: 'the formula draws nothing' }
  }

  // `raster`'s ink as a PNG of `columns` x `rows` cells: against `side` or
  // centred across, and `dy` points down or, without, centred down too.
  function picture(raster: Inked, { columns, rows, dy, side }: { columns: number; rows: number; dy?: number; side?: Side }): Rendered | RenderFailure {
    const refused = tooLarge(columns, rows)
    if (refused) return refused
    const width = Math.round(columns * grid.cellWidth * PX_PER_PT)
    const height = Math.round(rows * grid.cellHeight * PX_PER_PT)
    const { top, bottom, left, right } = raster.ink
    const slack = width - (right - left)
    const x = side === 'left' ? 0 : side === 'right' ? slack : Math.round(slack / 2)
    const y = dy === undefined ? Math.round((height - (bottom - top)) / 2) : Math.round(dy * PX_PER_PT)
    const pixels = place(raster, width, height, x, y)
    return { picture: { png: toBase64(encodePng(pixels, width, height)) }, columns, rows }
  }

  // `r`'s ink, in points at full resolution.
  const inkOf = (r: Inked): Ink => ({
    width: (r.ink.right - r.ink.left) / PX_PER_PT,
    above: (r.baseline - r.ink.top) / PX_PER_PT,
    below: (r.ink.bottom - r.baseline) / PX_PER_PT,
  })

  return {
    async ink(source) {
      return remembered(['ink', source], () => {
        const r = inked(source, false, style.inlineSize)
        return isFailure(r) ? r : inkOf(r)
      })
    },

    // As fitted: `scale` of its natural size, its ink `dy` points down its box.
    async picture(source, placement) {
      return remembered(['inline', source, placement], () => {
        const r = inked(source, false, style.inlineSize * placement.scale)
        return isFailure(r) ? r : picture(r, placement)
      })
    },

    // On its own, in whole cells with room around it: at its natural size,
    // or as small as it must be to fit `maxColumns`, down to MIN_READABLE.
    // Known by its scale, so every width it fits at its own size shares one.
    async block(source, maxColumns) {
      const natural = remembered(['block ink', source], () => {
        const r = inked(source, true, 1)
        return isFailure(r) ? r : inkOf(r)
      })
      if (isFailure(natural)) return natural
      const fits = blockCells(grid, natural.width, natural.above + natural.below).columns <= maxColumns
      // A hair under the width, so rounding to pixels cannot add a column.
      const scale = fits ? 1 : (0.99 * (maxColumns - 1) * grid.cellWidth) / natural.width
      if (scale < MIN_READABLE) return TOO_WIDE
      return remembered(['block', source, scale], () => {
        const r = inked(source, true, scale)
        if (isFailure(r)) return r
        const ink = inkOf(r)
        return picture(r, blockCells(grid, ink.width, ink.above + ink.below))
      })
    },
  }
}
