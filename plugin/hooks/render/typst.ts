// texel's contract with texel.typ: which entry point draws each job, and the
// inputs it reads. Everything that varies travels as an `--input`, so no LaTeX,
// colour or size is ever spliced into typst source. Pure: jobs in, programs
// and command lines out.

/** The terminal's grid and font, in points: what every figure is fitted to. */
export type Grid = {
  cellWidth: number
  cellHeight: number
  /** The terminal font's x-height; math is sized against it. */
  xHeight: number
  /** Where the baseline sits in a row, as a fraction of it from the top. */
  baseline: number
}

/** How things are set on that grid: the person's settings and macros. */
export type Style = {
  grid: Grid
  /** Ink colours, six hex digits. */
  mathColor: string
  typstColor: string
  /** Inline math's size: 1 matches the text's x-height. */
  inlineScale: number
  /** The person's LaTeX macros (`\newcommand`s), led into every formula. */
  macros: string
}

/** A formula's ink at its natural size, in points: what `inline-ink` reports. */
export type Ink = { width: number; above: number; below: number }

/** Where an inline formula is drawn: its box in cells, its scale, its offset down (pt). */
export type Placement = { columns: number; rows: number; scale: number; dy: number }

export type Job =
  /** An inline formula's ink, measured; read back with `typst eval`. */
  | { kind: 'ink'; tex: string }
  /** An inline formula, drawn as placed. */
  | { kind: 'inline'; tex: string; placement: Placement }
  /** LaTeX math on its own. */
  | { kind: 'display'; tex: string }
  /** Typst markup: a figure, or prose that wraps at the transcript's width. */
  | { kind: 'block'; typst: string }

/** One run of typst: a main file and the inputs it reads. */
export type Program = { source: string; inputs: Record<string, string> }

export const PPI = 216

/** The label `inline-ink` puts its measurement under. */
const INK_LABEL = 'ink'

/** The one input that ties a program to the transcript's width. */
const WIDTH = 'max-columns'

const main = (call: string, setup = 'setup') => `#import "/texel.typ": *\n#show: ${setup}\n${call}\n`

function gridInputs({ cellWidth, cellHeight, xHeight, baseline }: Grid, scale: number) {
  return {
    'cell-width': String(cellWidth),
    'cell-height': String(cellHeight),
    'x-height': String(xHeight),
    baseline: String(baseline),
    scale: String(scale),
  }
}

/**
 * The program that does `job`. Only a typst block is laid out against
 * `maxColumns`: math is drawn the same at any width, so a resize reuses it.
 * Ink has no colour, so a new colour never measures again.
 */
export function program(job: Job, style: Style, maxColumns: number): Program {
  const latex = (tex: string) => ({ tex, macros: style.macros })
  switch (job.kind) {
    case 'ink':
      return { source: main('#inline-ink()'), inputs: { ...gridInputs(style.grid, style.inlineScale), ...latex(job.tex) } }
    case 'inline': {
      const { columns, rows, scale, dy } = job.placement
      const placement = { 'fit-columns': String(columns), 'fit-rows': String(rows), 'fit-scale': String(scale), 'fit-dy': String(dy) }
      const inputs = { ...gridInputs(style.grid, style.inlineScale), foreground: style.mathColor, ...latex(job.tex), ...placement }
      return { source: main('#inline-latex()'), inputs }
    }
    case 'display':
      return {
        source: main('#display-math(latex(display: true))'),
        inputs: { ...gridInputs(style.grid, 1), foreground: style.mathColor, ...latex(job.tex) },
      }
    case 'block':
      return {
        source: main(`#typst-block[\n${job.typst}\n]`, 'setup.with(ink: false)'),
        inputs: { ...gridInputs(style.grid, 1), foreground: style.typstColor, [WIDTH]: String(maxColumns) },
      }
  }
}

/** `program` as it would be at any width: what a block drawn at natural size is known by. */
export function widthFree({ source, inputs }: Program): Program {
  const { [WIDTH]: _, ...rest } = inputs
  return { source, inputs: rest }
}

function flags(lib: string, { inputs }: Program) {
  return ['--root', lib, ...Object.entries(inputs).flatMap(([name, value]) => ['--input', `${name}=${value}`])]
}

/** `typst compile` of `program` (its source on stdin) into the PNG `out`. */
export function compileCommand(lib: string, program: Program, out: string) {
  return ['typst', 'compile', ...flags(lib, program), '--ppi', String(PPI), '-', out]
}

/** `typst eval` of `program` (its source on stdin), printing its ink as JSON. */
export function measureCommand(lib: string, program: Program) {
  return ['typst', 'eval', ...flags(lib, program), '--in', '-', `query(<${INK_LABEL}>).first().value`]
}
