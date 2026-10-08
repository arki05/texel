// The Compiler that runs the `typst` command line, one process per program,
// a few at a time. Each program's source goes in on stdin, its inputs as
// `--input` flags, with texel.typ's folder as the root.

import type { Limiter } from '../limit'
import type { RenderFailure } from '../result'
import type { Compiler } from './compiler'

export type Run = (argv: string[], stdin: string) => Promise<{ exitCode: number; stdout: string; stderr: string }>

export type CliOptions = {
  run: Run
  /** Shared by every draw, so the cap holds across the session. */
  limiter: Limiter
  /** The folder holding texel.typ. */
  lib: string
  /** `typst --version`'s version, and a hash of texel.typ: what makes the output. */
  version: string
  library: string
}

const PPI = 216

// Typst's own error: its first lines.
function complaint(stderr: string): RenderFailure {
  return { error: stderr.trim().split('\n').slice(0, 6).join('\n') }
}

export function cliCompiler({ run, limiter, lib, version, library }: CliOptions): Compiler {
  return {
    id: `typst-cli ${version} ppi ${PPI} texel.typ ${library}`,
    ppi: PPI,

    async compile(program, out) {
      const inputs = Object.entries(program.inputs).flatMap(([name, value]) => ['--input', `${name}=${value}`])
      // The format said, not read off `out`, which may be a temporary name.
      const argv = ['typst', 'compile', '--root', lib, ...inputs, '--format', 'png', '--ppi', String(PPI), '-', out]
      const result = await limiter.run(() => run(argv, program.source))
      return result.exitCode === 0 ? undefined : complaint(result.stderr)
    },
  }
}
