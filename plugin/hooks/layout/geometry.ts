// The geometry texel lays things out in: the terminal's cell grid and font,
// a formula's ink, and where a formula is placed in its cells. Shared by
// layout, rendering and the view; it depends on nothing.

/** The terminal's grid and font, in points: what every picture is fitted to. */
export type Grid = {
  cellWidth: number
  cellHeight: number
  /** The terminal font's x-height; math is sized against it. */
  xHeight: number
  /** Where the baseline sits in a row, as a fraction of it from the top. */
  baseline: number
}

/** A formula's ink at its natural size, in points: its width, and its reach above and below the baseline. */
export type Ink = { width: number; above: number; below: number }

/**
 * Where an inline formula is drawn: its box in cells, its scale, its ink's
 * offset down the box (pt), and which side of the box the ink keeps to,
 * centred if neither.
 */
export type Placement = { columns: number; rows: number; scale: number; dy: number; side?: 'left' | 'right' }

/**
 * Pixels per point a picture is made at, full size: 216 ppi, sharp at the
 * size terminals draw cells. The terminal scales each picture to its cells.
 */
export const PX_PER_PT = 3

/** The most cells a picture covers, each way: an Image's limit. */
export const MAX_CELLS = 255

/**
 * The cells a block (display math, a typst figure) takes: its ink, `width` x
 * `height` points, with a cell's width and half a row to spare, so it never
 * touches what is around it. texel.typ sizes typst figures by the same rule.
 */
export function blockCells(grid: Grid, width: number, height: number) {
  return {
    columns: Math.max(1, Math.ceil((width + grid.cellWidth) / grid.cellWidth)),
    rows: Math.max(1, Math.ceil((height + grid.cellHeight * 0.5) / grid.cellHeight)),
  }
}

/**
 * A terminal font's proportions, which are all the layout needs: pictures
 * are stretched to fill their cells, so only ratios matter. `aspect` is the
 * cell's height over its width; x-height and baseline are fractions of the
 * cell's height, the baseline measured from its top.
 */
export type TerminalFont = { aspect: number; xHeight: number; baseline: number }

/** The fonts terminals that show images default to, from their hhea and OS/2 tables. */
export const FONTS = {
  /** Ghostty's default. */
  'JetBrains Mono': { aspect: 2.2, xHeight: 0.4167, baseline: 0.7727 },
  /** kitty's default on macOS (Menlo) and Linux (DejaVu Sans Mono): one design. */
  'Menlo / DejaVu Sans Mono': { aspect: 1.9335, xHeight: 0.4698, baseline: 0.7974 },
  'SF Mono': { aspect: 1.9052, xHeight: 0.4465, baseline: 0.8209 },
  Monaco: { aspect: 2.1989, xHeight: 0.409, baseline: 0.7499 },
} satisfies Record<string, TerminalFont>

export type FontName = keyof typeof FONTS

// A nominal cell height, in points: it sets the pictures' resolution, not
// their size, which the terminal decides.
const CELL_HEIGHT = 17

export function gridFor({ aspect, xHeight, baseline }: TerminalFont): Grid {
  return { cellWidth: CELL_HEIGHT / aspect, cellHeight: CELL_HEIGHT, xHeight: xHeight * CELL_HEIGHT, baseline }
}
