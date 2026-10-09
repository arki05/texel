// The part of MathJax texel bundles into the plugin (scripts/build-vendor.mts):
// TeX in, MathJax's SVG out as a tree of plain objects. No DOM, no I/O, no
// dynamic loading: every TeX package and font is imported statically, since
// a hooks module may not `import()`.

import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js'
import 'mathjax-full/js/input/tex/base/BaseConfiguration.js'
import 'mathjax-full/js/input/tex/boldsymbol/BoldsymbolConfiguration.js'
import 'mathjax-full/js/input/tex/braket/BraketConfiguration.js'
import 'mathjax-full/js/input/tex/cancel/CancelConfiguration.js'
import 'mathjax-full/js/input/tex/color/ColorConfiguration.js'
import 'mathjax-full/js/input/tex/mathtools/MathtoolsConfiguration.js'
import 'mathjax-full/js/input/tex/newcommand/NewcommandConfiguration.js'
import 'mathjax-full/js/input/tex/textmacros/TextMacrosConfiguration.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { SVG } from 'mathjax-full/js/output/svg.js'

// Without `noundefined`, an unknown command is an error, as in LaTeX.
// `textmacros` reads \text{…} as LaTeX does: accents, $…$ and all.
const PACKAGES = ['base', 'ams', 'newcommand', 'boldsymbol', 'braket', 'mathtools', 'cancel', 'color', 'textmacros']

// The accents MathJax's fonts draw over a letter, by the combining mark Unicode decomposes them to.
const ACCENTS: Record<string, string> = {
  '\u0300': '`', '\u0301': "'", '\u0302': '^', '\u0303': '~', '\u0304': '=',
  '\u0306': 'u', '\u0307': '.', '\u0308': '"', '\u030C': 'v',
}

// A text-mode argument's opening: \text{, \textbf{, \mbox{ and the like.
const TEXT_ARGUMENT = /\\(?:text(?:rm|it|bf|sf|tt|up|sl|md|normal)?|mbox|hbox)\s*\{/g

/**
 * `tex` with the accented Latin letters in its text (\text{…} and the like,
 * outside any $…$ in it), which MathJax's fonts lack, as the TeX accents
 * they draw: `\text{für}` as `\text{f{\"{u}}r}`. A letter in math, one with an
 * accent they cannot draw, or an i or j (whose dot TeX drops first) stays as
 * it is, and fails naming itself.
 */
function accented(tex: string): string {
  let out = ''
  let from = 0
  for (const match of tex.matchAll(TEXT_ARGUMENT)) {
    if (match.index < from) continue
    const open = match.index + match[0].length
    const close = closingBrace(tex, open)
    if (close === undefined) break
    const text = tex.slice(open, close).split(/(?<!\\)(\$[^$]*\$)/)
    out += tex.slice(from, open) + text.map((part, i) => (i % 2 ? part : part.replace(/[À-ſ]/g, accent))).join('')
    from = close
  }
  return out + tex.slice(from)
}

function accent(letter: string): string {
  const [base = '', ...marks] = letter.normalize('NFD')
  const command = marks.length === 1 ? ACCENTS[marks[0]!] : undefined
  return command && /^[a-hk-zA-Z]$/.test(base) ? `{\\${command}{${base}}}` : letter
}

// The index of the brace that closes one opened just before `at`, escaped braces skipped.
function closingBrace(tex: string, at: number): number | undefined {
  let depth = 1
  for (let i = at; i < tex.length; i++) {
    if (tex[i] === '\\') i++
    else if (tex[i] === '{') depth++
    else if (tex[i] === '}' && --depth === 0) return i
  }
  return undefined
}

/** An SVG element: its tag, attributes and child elements, and a <text>'s characters. */
export type SvgNode = { tag: string; attrs: Record<string, string>; children: SvgNode[]; text?: string }
export type TexResult = SvgNode | { error: string }
export type Tex = { convert(tex: string, display: boolean): TexResult }

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)

function tree(node: unknown): SvgNode {
  const children = (adaptor.childNodes(node as never) as unknown[]).filter(child => adaptor.kind(child as never) !== '#text')
  const attrs: Record<string, string> = {}
  for (const { name, value } of adaptor.allAttributes(node as never)) attrs[name] = value
  const tag = adaptor.kind(node as never)
  return { tag, attrs, children: children.map(tree), ...(tag === 'text' && { text: adaptor.textContent(node as never) }) }
}

function find(node: SvgNode, test: (n: SvgNode) => boolean): SvgNode | undefined {
  if (test(node)) return node
  for (const child of node.children) {
    const found = find(child, test)
    if (found) return found
  }
  return undefined
}

const output = new SVG({ fontCache: 'none' })

// `tex` converted by `document`, as the formula's <svg>, or why it cannot be.
function convertIn(document: ReturnType<typeof mathjax.document>, tex: string, display: boolean): TexResult {
  let root: SvgNode
  try {
    root = tree(document.convert(accented(tex), { display, em: 16, ex: 8, containerWidth: 1280 }))
  } catch (e) {
    // MathJax's own failure, not a TeX error: too deep a nesting overflows its stack.
    return { error: `MathJax failed: ${e instanceof Error ? e.message : String(e)}` }
  }
  const svg = find(root, node => node.tag === 'svg')
  if (!svg) return { error: 'MathJax drew nothing' }
  const error = find(svg, node => node.attrs['data-mml-node'] === 'merror')
  return error ? { error: error.attrs['data-mjx-error'] ?? 'TeX error' } : svg
}

/**
 * A converter whose TeX knows `macros` (`\newcommand`s). Each formula is
 * converted in a document of its own, `macros` read first, so what one
 * formula defines never reaches the next: a fresh document costs a tenth of
 * a millisecond.
 */
export function createTex(macros: string): Tex {
  const documentWithMacros = () => {
    const document = mathjax.document('', { InputJax: new TeX({ packages: PACKAGES }), OutputJax: output })
    return { document, defined: macros.trim() ? convertIn(document, macros, false) : undefined }
  }
  const { defined } = documentWithMacros()
  if (defined && 'error' in defined) return { convert: () => ({ error: `in your macros: ${defined.error}` }) }
  return { convert: (tex, display) => convertIn(documentWithMacros().document, tex, display) }
}

/** MathJax's stylesheet for its SVG, which a page carries alongside it: what drawing.ts reads off by hand. */
export function stylesheet(): string {
  const document = mathjax.document('', { InputJax: new TeX({ packages: PACKAGES }), OutputJax: output })
  return adaptor.textContent(output.styleSheet(document) as never)
}
