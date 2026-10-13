// Something that runs texel's typst programs: the typst command line (cli.ts).
// The typst backend decides what to run and caches it; a compiler only runs it.

import type { RenderFailure } from '../result'
import type { Program } from './program'

export type Compiler = {
  /**
   * Everything about the compiler that changes its output: its kind, its typst
   * version, texel.typ itself. Part of every cache key, so pictures from one
   * compiler are never served for another.
   */
  readonly id: string
  /** Draws `program` into a PNG at `out`, at the program's ppi. */
  compile(program: Program, out: string): Promise<RenderFailure | undefined>
}
