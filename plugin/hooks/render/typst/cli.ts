// The Compiler that runs the `typst` command line, one process per program,
// a few at a time. Each program's source goes in on stdin, its inputs as
// `--input` flags, with texel.typ's folder as the root.

import { PX_PER_PT } from '../../geometry'
import type { RenderFailure } from '../result'
import type { Compiler } from './compiler'
import type { Limiter } from './limit'

export type Run = (argv: string[], stdin: string) => Promise<{ exitCode: number; stdout: string; stderr: string }>

export type CliOptions = {
  run: Run
  /** Shared by every draw, so the cap holds across the session. */
  limiter: Limiter
  /** The folder holding texel.typ. */
  libDir: string
  /** `typst --version`'s version: part of what makes the output. */
  version: string
  /** A hash of texel.typ: the rest of what makes it. */
  libraryHash: string
}

const PPI = PX_PER_PT * 72

// Typst's own error: its first lines, from the first `error:` on, past the
// progress typst writes to stderr too (`downloading @preview/…`).
function complaint(stderr: string): RenderFailure {
  const lines = stderr.trim().split('\n')
  const first = lines.findIndex(line => line.startsWith('error:'))
  return { error: lines.slice(Math.max(first, 0)).slice(0, 6).join('\n') }
}

export function cliCompiler({ run, limiter, libDir, version, libraryHash }: CliOptions): Compiler {
  return {
    id: `typst-cli ${version} ppi ${PPI} texel.typ ${libraryHash}`,
    ppi: PPI,

    async compile(program, out) {
      const inputs = Object.entries(program.inputs).flatMap(([name, value]) => ['--input', `${name}=${value}`])
      // The format said, not read off `out`, which may be a temporary name.
      const argv = ['typst', 'compile', '--root', libDir, ...inputs, '--format', 'png', '--ppi', String(PPI), '-', out]
      const result = await limiter.run(() => run(argv, program.source))
      return result.exitCode === 0 ? undefined : complaint(result.stderr)
    },
  }
}
