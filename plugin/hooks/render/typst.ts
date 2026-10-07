// texel's contract with texel.typ: which entry point does each job, and the
// inputs it reads. Everything that varies travels as an input, so no LaTeX,
// colour or size is ever spliced into typst source. Pure: jobs in, programs out.

import type { Grid, Placement } from '../layout/geometry'

/** How things are set on the grid: the person's settings and macros. */
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

export type Job =
  /** An inline formula's ink, measured. */
  | { kind: 'ink'; tex: string }
  /** An inline formula, drawn as placed. */
  | { kind: 'inline'; tex: string; placement: Placement }
  /** LaTeX math on its own. */
  | { kind: 'display'; tex: string }
  /** Typst markup, laid out at most `maxColumns` wide: a figure, or prose that wraps. */
  | { kind: 'typst'; typst: string; maxColumns: number }

/** A job that draws a picture: every kind but measuring. */
export type DrawJob = Exclude<Job, { kind: 'ink' }>

/** One run of typst: a main file and the inputs it reads. */
export type Program = { source: string; inputs: Record<string, string> }

/** The input that ties a program to the transcript's width: only a typst block has it. */
const WIDTH = 'max-columns'

const main = (call: string) => `#import "/texel.typ": *\n${call}\n`

function grid({ cellWidth, cellHeight, xHeight, baseline }: Grid, scale: number) {
  return {
    'cell-width': String(cellWidth),
    'cell-height': String(cellHeight),
    'x-height': String(xHeight),
    baseline: String(baseline),
    scale: String(scale),
  }
}

/**
 * The program that does `job`, through the texel.typ entry point of the same
 * name. Math draws the same at any width, so a resize reuses it; ink has no
 * colour, so a new colour never measures again.
 */
export function program(job: Job, style: Style): Program {
  const latex = (tex: string) => ({ tex, macros: style.macros })
  switch (job.kind) {
    case 'ink':
      return { source: main('#inline-ink()'), inputs: { ...grid(style.grid, style.inlineScale), ...latex(job.tex) } }
    case 'inline': {
      const { columns, rows, scale, dy } = job.placement
      const placement = { 'fit-columns': String(columns), 'fit-rows': String(rows), 'fit-scale': String(scale), 'fit-dy': String(dy) }
      return {
        source: main('#inline-math()'),
        inputs: { ...grid(style.grid, style.inlineScale), foreground: style.mathColor, ...latex(job.tex), ...placement },
      }
    }
    case 'display':
      return { source: main('#display-math()'), inputs: { ...grid(style.grid, 1), foreground: style.mathColor, ...latex(job.tex) } }
    case 'typst':
      return {
        source: main(`#typst-block[\n${job.typst}\n]`),
        inputs: { ...grid(style.grid, 1), foreground: style.typstColor, [WIDTH]: String(job.maxColumns) },
      }
  }
}

/** Whether typst markup imports or includes a package (`"@preview/..."`), which typst downloads. */
export function importsPackage(typst: string) {
  return /#(?:import|include)\s+"@[\w-]+\//.test(typst)
}

/** `program` as it would be at any width: what a block drawn at its natural size is known by. */
export function widthFree({ source, inputs }: Program): Program {
  const { [WIDTH]: _, ...rest } = inputs
  return { source, inputs: rest }
}
