// Runs both backends for real, with the inputs texel produces: MathJax on
// LaTeX (inline, display, an error), its drawing and rasteriser against resvg
// as a reference over a corpus of formulas, and the typst command line on typst blocks (a figure, prose, an
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
import { FONTS, gridFor, type Ink } from '../plugin/hooks/geometry.ts'
import { hash } from '../plugin/hooks/render/hash.ts'
import { Limiter } from '../plugin/hooks/render/typst/limit.ts'
import { createMathBackend, MathCache } from '../plugin/hooks/render/mathjax/backend.ts'
import { CORPUS } from '../plugin/hooks/render/mathjax/corpus.ts'
import { drawingOf } from '../plugin/hooks/render/mathjax/drawing.ts'
import { rasterize } from '../plugin/hooks/render/mathjax/raster.ts'
import { createTex, stylesheet, type SvgNode } from '../plugin/hooks/render/mathjax/vendor/mathjax-entry.js'
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

// Drawing and rasteriser against resvg, on the same MathJax SVG at the same
// size, pixel for pixel over the viewBox. MathJax's stylesheet goes in with
// the SVG, as a page would carry it, so resvg draws the table rules as a
// browser does. Backgrounds come out of the reference, as texel leaves them
// out. resvg shades by 4x4 supersampling, in 16 steps of coverage, so every
// edge pixel may differ by up to 8, and a small formula is mostly edges: the
// mean stays low but not near 0. A real fault (a shifted edge, a lost curve,
// a filled hole) differs by far more than 64, over many pixels.
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const serialize = (n: SvgNode): string =>
  'data-bgcolor' in n.attrs
    ? ''
    : `<${n.tag}${Object.entries(n.attrs).map(([k, v]) => ` ${k}="${escape(v)}"`).join('')}>${n.text ? escape(n.text) : ''}${n.children.map(serialize).join('')}</${n.tag}>`

const tex = createTex('')
const css = stylesheet()
for (const source of CORPUS) {
  for (const pxPerEm of [57, 20]) {
    const svg = tex.convert(source, true) as SvgNode
    const drawing = drawingOf(svg)
    const ours = isFailure(drawing) ? drawing : rasterize(drawing, pxPerEm, [0, 0, 0])
    const name = `raster vs resvg ${pxPerEm}px ${source}`.slice(0, 42).padEnd(42)
    if (isFailure(ours)) {
      failures++
      console.log(`FAIL ${name} ${ours.error}`)
      continue
    }
    // resvg rounds a canvas to whole pixels and scales the drawing to fit:
    // widen the viewBox to a whole number of pixels instead, so nothing scales.
    const [minX = 0, minY = 0, w = 0, h = 0] = svg.attrs.viewBox!.split(/\s+/).map(Number)
    const k = pxPerEm / 1000
    const [pw, ph] = [Math.ceil(w * k), Math.ceil(h * k)]
    const viewBox = `${minX} ${minY} ${pw / k} ${ph / k}`
    const root = { ...svg, attrs: { ...svg.attrs, viewBox, width: String(pw), height: String(ph), color: '#000', style: '' } }
    const markup = serialize(root).replace(/^(<svg[^>]*>)/, `$1<style>${css}</style>`)
    const reference = new Resvg(markup, { fitTo: { mode: 'original' } }).render()
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
    const agrees = mean < 6 && differing / (reference.width * reference.height) < 0.002
    if (!agrees) failures++
    console.log(`${agrees ? 'ok  ' : 'FAIL'} ${name} mean |Δα| ${mean.toFixed(2)}, worst ${worst}, ${differing} of ${reference.width * reference.height} px off by >64`)
  }
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
    allowPackages: true,
  })
  check('typst figure', await typst.fresh({ kind: 'typst', typst: '$ sum_(k=1)^n k $', maxColumns: 80 }))
  check('typst prose', await typst.fresh({ kind: 'typst', typst: 'A paragraph long enough to wrap. '.repeat(8), maxColumns: 40 }))
  check('typst block with its own page rule', await typst.fresh({ kind: 'typst', typst: '#set page(width: auto, margin: 8pt)\n$ a^2 + b^2 = c^2 $', maxColumns: 80 }))
  // Content that stretches to its width (a 1fr column) measures tall without one: it must not come out tall.
  const stretchy = await typst.fresh({ kind: 'typst', typst: '#table(columns: (auto, 1fr), [Area], [A finding long enough to wrap if its column had no width], [Parser], [fixed])', maxColumns: 120 })
  check('typst stretchy table is sized at its width', isFailure(stretchy) || stretchy.rows > 4 ? { error: `rows ${'rows' in stretchy ? stretchy.rows : '?'}` } : stretchy)
    check('typst syntax error is reported', await typst.fresh({ kind: 'typst', typst: '#let x = (', maxColumns: 40 }), true)
}

console.log(failures ? `\n${failures} failed` : '\nboth backends work')
process.exit(failures ? 1 : 0)
