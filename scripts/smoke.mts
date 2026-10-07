// Runs every texel.typ entry point through the real renderer and the typst
// command line, with the inputs render/typst.ts produces: the check `claude
// plugin test` cannot make, since it runs no processes. Exits non-zero on any
// failure.
//
//   npx tsx scripts/smoke.mts

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { fitInline, DEFAULT_FIT } from '../plugin/hooks/layout/fit.ts'
import { FONTS, gridFor } from '../plugin/hooks/layout/geometry.ts'
import { hash } from '../plugin/hooks/render/hash.ts'
import { Limiter } from '../plugin/hooks/render/limit.ts'
import { createRenderer, RenderCache } from '../plugin/hooks/render/renderer.ts'
import { isFailure } from '../plugin/hooks/render/result.ts'
import { cliCompiler } from '../plugin/hooks/render/typst-cli.ts'

const lib = new URL('../plugin/hooks/render', import.meta.url).pathname
const version = /typst (\S+)/.exec(spawnSync('typst', ['--version'], { encoding: 'utf8' }).stdout ?? '')?.[1]
if (!version) throw new Error('typst not found')

const grid = gridFor(FONTS['JetBrains Mono'])
const renderer = createRenderer({
  io: {
    exists: async path => existsSync(path),
    readText: async path => readFileSync(path, 'utf8'),
    writeText: async (path, text) => writeFileSync(path, text),
    readBase64: async path => readFileSync(path).toString('base64'),
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
  cache: new RenderCache(),
  // A fresh folder: every run happens, none is served from an earlier one.
  cacheDir: mkdtempSync(join(tmpdir(), 'texel-smoke-')),
  style: { grid, mathColor: 'b3bd5a', typstColor: 'e6e6e6', inlineScale: 1.2, macros: '\\newcommand{\\R}{\\mathbb{R}}' },
})

let failures = 0
function check(name: string, result: object) {
  const failed = isFailure(result)
  if (failed) failures++
  console.log(`${failed ? 'FAIL' : 'ok  '} ${name.padEnd(40)} ${JSON.stringify(failed ? result : { ...result, file: undefined })}`)
}

for (const tex of ['x', 'x_i^2', '\\frac{a}{b}', '\\R^n', '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}']) {
  const ink = await renderer.fresh.ink(tex)
  check(`ink ${tex}`, ink)
  if (isFailure(ink)) continue
  const { placement } = fitInline(ink, grid, 80, DEFAULT_FIT)
  check(`inline ${tex}`, await renderer.fresh.picture({ kind: 'inline', tex, placement }))
}
check('display', await renderer.fresh.picture({ kind: 'display', tex: '\\int_0^1 x^2 \\, dx = \\frac{1}{3}' }))
check('typst figure', await renderer.fresh.picture({ kind: 'typst', typst: '$ sum_(k=1)^n k $', maxColumns: 80 }))
check('typst prose', await renderer.fresh.picture({ kind: 'typst', typst: 'A paragraph long enough to wrap. '.repeat(8), maxColumns: 40 }))
const broken = await renderer.fresh.picture({ kind: 'typst', typst: '#let x = (', maxColumns: 40 })
check('typst syntax error is reported', isFailure(broken) ? {} : { error: 'a syntax error rendered' })

console.log(failures ? `\n${failures} failed` : '\nall entry points work')
process.exit(failures ? 1 : 0)
