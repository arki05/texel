// Runs both backends for real, with the inputs texel produces: MathJax on
// LaTeX (inline, display, an error), its drawing and rasteriser against
// resvg as a reference over a corpus of formulas, and the typst command line
// on typst blocks. `claude plugin test` runs no processes, so this is where
// typst and texel.typ meet. Exits non-zero on any failure.
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
import { accented } from '../plugin/hooks/render/mathjax/accents.ts'
import { CORPUS } from '../plugin/hooks/render/mathjax/corpus.ts'
import { drawingOf } from '../plugin/hooks/render/mathjax/drawing.ts'
import { rasterize } from '../plugin/hooks/render/mathjax/raster.ts'
import { createTex, stylesheet, type SvgNode } from '../plugin/hooks/render/mathjax/vendor/mathjax-entry.js'
import { pngSize } from '../plugin/hooks/render/png.ts'
import { isFailure } from '../plugin/hooks/render/result.ts'
import { readSettings } from '../plugin/hooks/settings.ts'
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
  check(`mathjax inline ${tex}`, await math.picture(tex, placement))
}
check('mathjax display', (await math.block('\\int_0^1 x^2 \\, dx = \\frac{1}{3}', 80))!)
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
    const svg = tex.convert(accented(source), true) as SvgNode
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

// The manifest's defaults, which Claude Code fills in, read as the code's own
// fallbacks for a value left unset; colours differ by design (unset follows
// the text).
const manifest = JSON.parse(readFileSync(new URL('../plugin/.claude-plugin/plugin.json', import.meta.url), 'utf8'))
const defaults = Object.fromEntries(Object.entries(manifest.userConfig as Record<string, { default?: unknown }>).map(([key, option]) => [key, option.default]))
const uncoloured = (options: Record<string, unknown>) => ({ ...readSettings(options as never), mathColor: undefined, typstColor: undefined })
const [fromManifest, fromCode] = [uncoloured(defaults), uncoloured({})]
const agree = JSON.stringify(fromManifest) === JSON.stringify(fromCode)
if (!agree) failures++
console.log(`${agree ? 'ok  ' : 'FAIL'} ${'manifest defaults are the code\'s'.padEnd(42)} ${agree ? '' : JSON.stringify({ fromManifest, fromCode })}`)

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
  check('typst figure', await typst.fresh({ typst: '$ sum_(k=1)^n k $', maxColumns: 80 }))
  check('typst prose', await typst.fresh({ typst: 'A paragraph long enough to wrap. '.repeat(8), maxColumns: 40 }))
  check('typst block with its own page rule', await typst.fresh({ typst: '#set page(width: auto, margin: 8pt)\n$ a^2 + b^2 = c^2 $', maxColumns: 80 }))
  // Content that stretches to its width (a 1fr column) measures tall without one: it must not come out tall.
  const stretchy = await typst.fresh({ typst: '#table(columns: (auto, 1fr), [Area], [A finding long enough to wrap if its column had no width], [Parser], [fixed])', maxColumns: 120 })
  check('typst stretchy table is sized at its width', isFailure(stretchy) || stretchy.rows > 4 ? { error: `rows ${'rows' in stretchy ? stretchy.rows : '?'}` } : stretchy)
  // Blocks like the ones Claude writes, each at a narrow and a wide width:
  // drawn, on whole cells, and no taller than their content needs. Those
  // that import a package run with --packages, as typst downloads them.
  const corpus: { name: string; typst: string; packages?: true }[] = [
    { name: 'long prose', typst: 'A paragraph that goes on long enough to wrap at any width a terminal has. '.repeat(6) },
    { name: 'headings, a list and math', typst: '= Title\nSome text with $x^2$.\n- one\n- two, $integral_0^1 x dif x$\n$ sum_(k=1)^n k = n(n+1)/2 $' },
    { name: 'a table with a 1fr column', typst: '#table(columns: (auto, 1fr, auto), [*A*], [*Finding*], [*B*], [x], [A finding that wraps when its column is narrow enough to make it], [y])' },
    { name: 'two columns in a grid', typst: '#grid(columns: (1fr, 1fr), gutter: 12pt, [== Left\n' + 'Words on the left. '.repeat(8) + '], [== Right\n$ e^(i pi) + 1 = 0 $])' },
    { name: 'filled boxes and a note', typst: '#block(width: 100%, inset: 8pt, radius: 4pt, fill: rgb("#b3bd5a").transparentize(85%))[*Note* a filled box.] #box(inset: 4pt, fill: blue)[pill]' },
    { name: 'a fletcher diagram', packages: true, typst: '#import "@preview/fletcher:0.5.8" as fletcher: diagram, node, edge\n#diagram(node((0, 0), $A$), edge("->", bend: 20deg), node((1, 0), $B$), node((0, 1), [box], stroke: 0.5pt))' },
    { name: 'a cetz canvas', packages: true, typst: '#import "@preview/cetz:0.4.2"\n#cetz.canvas({ import cetz.draw: *; set-style(stroke: white); line((0, 0), (3, 1)); circle((4, 0.5), radius: 0.5) })' },
  ]
  const withPackages = process.argv.includes('--packages')
  const pixelsPerCell = grid.cellWidth * 3
  for (const block of corpus) {
    if (block.packages && !withPackages) {
      console.log(`skip ${`typst ${block.name}`.padEnd(42)} (imports a package: run with --packages)`)
      continue
    }
    for (const maxColumns of [40, 120]) {
      const drawn = await typst.fresh({ typst: block.typst, maxColumns })
      const name = `typst ${block.name} at ${maxColumns}`
      if (isFailure(drawn) || !('file' in drawn.picture)) {
        check(name, isFailure(drawn) ? drawn : { error: 'not a file' })
        continue
      }
      const { width, height } = pngSize(readFileSync(drawn.picture.file).toString('base64'))
      const whole = Math.abs(width / pixelsPerCell - Math.round(width / pixelsPerCell)) < 0.02 && height % (grid.cellHeight * 3) === 0
      check(name, whole && drawn.columns <= maxColumns && drawn.rows < 60 ? drawn : { error: `${width} x ${height} px, ${drawn.columns} x ${drawn.rows} cells` })
    }
  }
  check('typst syntax error is reported', await typst.fresh({ typst: '#let x = (', maxColumns: 40 }), true)
}

console.log(failures ? `\n${failures} failed` : '\nboth backends work')
process.exit(failures ? 1 : 0)
