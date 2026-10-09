// Fits an inline formula into a line of terminal text, as TeX fits a tall box
// into a paragraph: the line grows to hold it. Here it grows by whole rows,
// so the formula keeps its size and the rows around the text make room.
// Pure: points and cells in, a placement out.

import type { Grid, Ink, Placement } from './geometry'

/** The person's settings (plugin.json `userConfig`); scales of natural size, shifts in rows. */
export type FitOptions = {
  /** How far a formula may grow to fill its rows; 1 never grows. */
  maxScale: number
  /**
   * How far it may shrink before its line gains a row. At 0.75, scripts and
   * parentheses (κ_c(t): 0.86, x_i^2: 0.78) stay in their row, while
   * fractions, limits and matrices (0.65 and below) get room.
   */
  minScale: number
  /** How far above or below the text's baseline it may sit to save a row. */
  shiftUp: number
  shiftDown: number
}

export const DEFAULT_FIT: FitOptions = { maxScale: 1, minScale: 0.75, shiftUp: 0.5, shiftDown: 0.5 }

export type InlineFit = {
  /** Rows added above and below the text's row. */
  above: number
  below: number
  /** The formula's box, `1 + above + below` rows tall, and how it sits in it. */
  placement: Placement
}

/**
 * The least scale a formula is drawn at: one that only fits the line smaller
 * than this (a long formula in a narrow terminal) is too small to read, and
 * shows its source instead.
 */
export const MIN_READABLE = 0.5

/** Past this many extra rows, the formula shrinks instead. */
const MAX_EXTRA_ROWS = 8
/** Ink never quite touches the box's edge. */
const FILL = 0.98

function place(ink: Ink, grid: Grid, options: FitOptions, maxColumns: number, above: number, below: number): InlineFit {
  const { cellWidth: cw, cellHeight: ch } = grid
  const height = (1 + above + below) * ch
  const baseline = above * ch + grid.baseline * ch
  const total = ink.above + ink.below
  const scale = Math.min(
    options.maxScale,
    (height * FILL) / total,
    // Sitting lower leaves more room above the baseline; higher, below it.
    (baseline + options.shiftDown * ch) / Math.max(ink.above, 0.01),
    (height - baseline + options.shiftUp * ch) / Math.max(ink.below, 0.01),
    (maxColumns * cw) / ink.width,
  )
  // On the baseline where the box allows, else as near to it as it does.
  const dy = Math.min(Math.max(baseline - ink.above * scale, 0), height - total * scale)
  // Capped by the width, the product lands on maxColumns give or take float
  // noise; ceil of the noise would make the formula a column too wide.
  const columns = Math.max(1, Math.min(maxColumns, Math.ceil((ink.width * scale) / cw - 1e-9)))
  return { above, below, placement: { columns, rows: 1 + above + below, scale, dy } }
}

// The ways to share `extra` rows, best first: alternating, one above first
// (above, above+below, two above + below, ...), then leaning above, then below.
function splits(extra: number) {
  const even = Math.ceil(extra / 2)
  const rest = Array.from({ length: extra + 1 }, (_, i) => extra - i).filter(above => above !== even)
  return [even, ...rest].map(above => [above, extra - above] as const)
}

/**
 * The fewest extra rows that hold the formula at no less than `minScale`,
 * the alternating split preferred among equals; past MAX_EXTRA_ROWS, the
 * best that many rows allow.
 */
export function fitInline(ink: Ink, grid: Grid, maxColumns: number, options: FitOptions = DEFAULT_FIT): InlineFit {
  // A formula too wide for the line shrinks whatever its rows; more rows
  // cannot buy back what the width takes.
  const enough = Math.min(options.minScale, (maxColumns * grid.cellWidth) / ink.width)
  let best: InlineFit | undefined
  for (let extra = 0; extra <= MAX_EXTRA_ROWS; extra++) {
    for (const [above, below] of splits(extra)) {
      const fit = place(ink, grid, options, maxColumns, above, below)
      if (fit.placement.scale >= enough) return fit
      if (!best || fit.placement.scale > best.placement.scale) best = fit
    }
  }
  return best!
}
