// Runs both backends for real, with the inputs texel produces: MathJax on
// LaTeX (inline, display, an error), the rasteriser against resvg as a
// reference, and the typst command line on typst blocks (a figure, prose, an
// error). `claude plugin test` runs no processes,
// so this is where typst and texel.typ meet. Exits non-zero on any failure.
//
//   npm run smoke

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, renameSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Resvg } from '@resvg/resvg-js'

import { DEFAULT_FIT, fitInline } from '../plugin/hooks/layout/fit.ts'
import { FONTS, gridFor, type Ink } from '../plugin/hooks/layout/geometry.ts'
import { hash } from '../plugin/hooks/render/hash.ts'
import { Limiter } from '../plugin/hooks/render/limit.ts'
import { createMathBackend, MathCache } from '../plugin/hooks/render/mathjax/backend.ts'
import { rasterize } from '../plugin/hooks/render/mathjax/raster.ts'
import { createTex, type SvgNode } from '../plugin/hooks/render/mathjax/vendor/mathjax-entry.js'
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

// The rasteriser against resvg, on the same MathJax SVG at the same size,
// pixel for pixel from the viewBox's corner. resvg shades by 4x4
// supersampling and blends overlapping shapes one by one, so small glyphs and
// overlaps differ a little; a real fault (a shifted edge, a lost curve, a
// filled hole) differs a lot, over many pixels.
const serialize = (n: SvgNode): string =>
  `<${n.tag}${Object.entries(n.attrs).map(([k, v]) => ` ${k}="${v.replace(/"/g, '&quot;')}"`).join('')}>${n.children.map(serialize).join('')}</${n.tag}>`

const tex = createTex('')
for (const [source, pxPerEm] of [['\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}', 57], ['\\sum_{k=1}^n k^2', 57], ['\\mathbb{R}^n \\otimes \\mathcal{H}', 20]] as const) {
  const svg = tex.convert(source, true) as SvgNode
  const ours = rasterize(svg, pxPerEm, [0, 0, 0])
  // resvg rounds a canvas to whole pixels and scales the drawing to fit:
  // widen the viewBox to a whole number of pixels instead, so nothing scales.
  const [minX = 0, minY = 0, w = 0, h = 0] = svg.attrs.viewBox!.split(/\s+/).map(Number)
  const k = pxPerEm / 1000
  const [pw, ph] = [Math.ceil(w * k), Math.ceil(h * k)]
  const viewBox = `${minX} ${minY} ${pw / k} ${ph / k}`
  const root = { ...svg, attrs: { ...svg.attrs, viewBox, width: String(pw), height: String(ph), color: '#000', style: '' } }
  const reference = new Resvg(serialize(root), { fitTo: { mode: 'original' } }).render()
  let [worst, total, differing] = [0, 0, 0]
  for (let y = 0; y < reference.height; y++)
    for (let x = 0; x < reference.width; x++) {
      const mine = ours.rgba[((y + ours.origin.y) * ours.width + x + ours.origin.x) * 4 + 3]!
      const theirs = reference.pixels[(y * reference.width + x) * 4 + 3]!
      const d = Math.abs(mine - theirs)
      worst = Math.max(worst, d)
      total += d
      if (d > 64) differing++
    }
  const mean = total / (reference.width * reference.height)
  const agrees = mean < 4 && differing / (reference.width * reference.height) < 0.001
  if (!agrees) failures++
  console.log(`${agrees ? 'ok  ' : 'FAIL'} ${`raster vs resvg ${source}`.slice(0, 42).padEnd(42)} mean |Δα| ${mean.toFixed(2)}, worst ${worst}, ${differing} of ${reference.width * reference.height} px off by >64`)
}

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
  check('typst block with its own page rule', await typst.fresh({ kind: 'typst', typst: '#set page(width: auto, margin: 8pt)\n$ a^2 + b^2 = c^2 $', maxColumns: 80 }))
  check('typst syntax error is reported', await typst.fresh({ kind: 'typst', typst: '#let x = (', maxColumns: 40 }), true)
}

console.log(failures ? `\n${failures} failed` : '\nboth backends work')
process.exit(failures ? 1 : 0)
