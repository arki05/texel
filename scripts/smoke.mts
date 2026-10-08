// Runs both backends for real, with the inputs texel produces: MathJax on
// LaTeX (inline, display, an error) and the typst command line on typst
// blocks (a figure, prose, an error). `claude plugin test` runs no processes,
// so this is where typst and texel.typ meet. Exits non-zero on any failure.
//
//   npm run smoke

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, renameSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { DEFAULT_FIT, fitInline } from '../plugin/hooks/layout/fit.ts'
import { FONTS, gridFor, type Ink } from '../plugin/hooks/layout/geometry.ts'
import { hash } from '../plugin/hooks/render/hash.ts'
import { Limiter } from '../plugin/hooks/render/limit.ts'
import { createMathBackend, MathCache } from '../plugin/hooks/render/mathjax/backend.ts'
import { isFailure } from '../plugin/hooks/render/result.ts'
import { createTypstBackend, TypstCache } from '../plugin/hooks/render/typst/backend.ts'
import { cliCompiler } from '../plugin/hooks/render/typst/cli.ts'

const lib = new URL('../plugin/hooks/render/typst', import.meta.url).pathname
const grid = gridFor(FONTS['JetBrains Mono'])

let failures = 0
function check(name: string, result: object, expectFailure = false) {
  const failed = isFailure(result) !== expectFailure
  if (failed) failures++
  const shown = isFailure(result) ? result : { ...result, picture: undefined }
  console.log(`${failed ? 'FAIL' : 'ok  '} ${name.padEnd(42)} ${JSON.stringify(shown).slice(0, 110)}`)
}

// MathJax, in this process as in the hooks module.
const math = createMathBackend(new MathCache(), { grid, color: 'b3bd5a', inlineScale: 1.2, macros: '\\newcommand{\\R}{\\mathbb{R}}' })
for (const tex of ['x', 'x_i^2', '\\frac{a}{b}', '\\R^n', '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}']) {
  const ink = await math.ink(tex)
  check(`mathjax ink ${tex}`, ink)
  if (isFailure(ink)) continue
  const { placement } = fitInline(ink as Ink, grid, 80, DEFAULT_FIT)
  check(`mathjax inline ${tex}`, await math.picture({ kind: 'inline', tex, placement }))
}
check('mathjax display', await math.picture({ kind: 'display', tex: '\\int_0^1 x^2 \\, dx = \\frac{1}{3}' }))
check('mathjax error is reported', await math.ink('\\frac{a}{'), true)

// Typst blocks, through the typst command line.
const version = /typst (\S+)/.exec(spawnSync('typst', ['--version'], { encoding: 'utf8' }).stdout ?? '')?.[1]
if (!version) {
  console.log('skip typst blocks: typst not found')
} else {
  const typst = createTypstBackend({
    io: {
      exists: async path => existsSync(path),
      readBase64: async path => readFileSync(path).toString('base64'),
      rename: async (from, to) => renameSync(from, to),
    },
    compiler: cliCompiler({
      run: async (argv, stdin) => {
        const result = spawnSync(argv[0]!, argv.slice(1), { input: stdin, encoding: 'utf8' })
        return { exitCode: result.status ?? 1, stdout: result.stdout, stderr: result.stderr }
      },
      limiter: new Limiter(4),
      lib,
      version,
      library: await hash(readFileSync(join(lib, 'texel.typ'), 'utf8')),
    }),
    cache: new TypstCache(),
    // A fresh folder: every run happens, none is served from an earlier one.
    cacheDir: mkdtempSync(join(tmpdir(), 'texel-smoke-')),
    style: { grid, color: 'e6e6e6' },
  })
  check('typst figure', await typst.fresh({ kind: 'typst', typst: '$ sum_(k=1)^n k $', maxColumns: 80 }))
  check('typst prose', await typst.fresh({ kind: 'typst', typst: 'A paragraph long enough to wrap. '.repeat(8), maxColumns: 40 }))
  check('typst syntax error is reported', await typst.fresh({ kind: 'typst', typst: '#let x = (', maxColumns: 40 }), true)
}

console.log(failures ? `\n${failures} failed` : '\nboth backends work')
process.exit(failures ? 1 : 0)
