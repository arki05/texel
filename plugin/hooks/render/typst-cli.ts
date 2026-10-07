// The Compiler that runs the `typst` command line, one process per program,
// a few at a time. Each program's source goes in on stdin, its inputs as
// `--input` flags, with texel.typ's folder as the root and its bundled
// packages (mitex) found first, so LaTeX renders offline.

import type { Ink } from '../layout/geometry'
import type { Compiler } from './compiler'
import type { Limiter } from './limit'
import type { RenderFailure } from './result'
import type { Program } from './typst'

export type Run = (argv: string[], stdin: string) => Promise<{ exitCode: number; stdout: string; stderr: string }>

export type CliOptions = {
  run: Run
  /** Shared by every draw, so the cap holds across the session. */
  limiter: Limiter
  /** The folder holding texel.typ and packages/. */
  lib: string
  /** `typst --version`'s version, and a hash of texel.typ: what makes the output. */
  version: string
  library: string
}

const PPI = 216

/** The label `inline-ink` puts its measurement under. */
const INK_LABEL = 'ink'

// Typst's own error: its first lines.
function complaint(stderr: string): RenderFailure {
  return { error: stderr.trim().split('\n').slice(0, 6).join('\n') }
}

function flags(lib: string, { inputs }: Program) {
  const entries = Object.entries(inputs).flatMap(([name, value]) => ['--input', `${name}=${value}`])
  return ['--root', lib, '--package-path', `${lib}/packages`, ...entries]
}

export function cliCompiler({ run, limiter, lib, version, library }: CliOptions): Compiler {
  return {
    id: `typst-cli ${version} ppi ${PPI} texel.typ ${library}`,
    ppi: PPI,

    async compile(program, out) {
      const argv = ['typst', 'compile', ...flags(lib, program), '--ppi', String(PPI), '-', out]
      const result = await limiter.run(() => run(argv, program.source))
      return result.exitCode === 0 ? undefined : complaint(result.stderr)
    },

    async measure(program) {
      const argv = ['typst', 'eval', ...flags(lib, program), '--in', '-', `query(<${INK_LABEL}>).first().value`]
      const result = await limiter.run(() => run(argv, program.source))
      return result.exitCode === 0 ? (JSON.parse(result.stdout) as Ink) : complaint(result.stderr)
    },
  }
}
