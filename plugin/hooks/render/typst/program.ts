// texel's contract with texel.typ: the program that lays out a typst block,
// as a fixed main file and the inputs it reads. Everything that varies is an
// input; only the block's own markup is source. Pure: jobs in, programs out.

import type { Grid } from '../../layout/geometry'
import type { TypstJob } from '../renderer'

/** How typst blocks are set: on which grid, in what colour (six hex digits). */
export type TypstStyle = { grid: Grid; color: string }

/** One run of typst: a main file and the inputs it reads. */
export type Program = { source: string; inputs: Record<string, string> }

/** The input that ties a program to the transcript's width. */
const WIDTH = 'max-columns'

/** The program that lays out `job` through texel.typ's `typst-block`. */
export function program(job: TypstJob, { grid, color }: TypstStyle): Program {
  return {
    source: `#import "/texel.typ": *\n#typst-block[\n${job.typst}\n]\n`,
    inputs: {
      'cell-width': String(grid.cellWidth),
      'cell-height': String(grid.cellHeight),
      'x-height': String(grid.xHeight),
      foreground: color,
      [WIDTH]: String(job.maxColumns),
    },
  }
}

/** `program` as it would be at any width: what a block drawn at its natural size is known by. */
export function widthFree({ source, inputs }: Program): Program {
  const { [WIDTH]: _, ...rest } = inputs
  return { source, inputs: rest }
}

/** Whether typst markup imports or includes a package (`"@preview/..."`), which typst downloads. */
export function importsPackage(typst: string) {
  return /#(?:import|include)\s+"@[\w-]+\//.test(typst)
}
