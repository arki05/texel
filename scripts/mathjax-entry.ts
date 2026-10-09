// The part of MathJax texel bundles into the plugin (scripts/build-vendor.mts):
// TeX in, MathJax's SVG out as a tree of plain objects. No DOM, no I/O, no
// dynamic loading: every TeX package and font is imported statically, since
// a hooks module may not `import()`.

import { liteAdaptor } from 'mathjax-full/ts/adaptors/liteAdaptor.ts'
import { RegisterHTMLHandler } from 'mathjax-full/ts/handlers/html.ts'
import 'mathjax-full/ts/input/tex/ams/AmsConfiguration.ts'
import 'mathjax-full/ts/input/tex/base/BaseConfiguration.ts'
import 'mathjax-full/ts/input/tex/boldsymbol/BoldsymbolConfiguration.ts'
import 'mathjax-full/ts/input/tex/braket/BraketConfiguration.ts'
import 'mathjax-full/ts/input/tex/cancel/CancelConfiguration.ts'
import 'mathjax-full/ts/input/tex/color/ColorConfiguration.ts'
import 'mathjax-full/ts/input/tex/mathtools/MathtoolsConfiguration.ts'
import 'mathjax-full/ts/input/tex/newcommand/NewcommandConfiguration.ts'
import 'mathjax-full/ts/input/tex/textmacros/TextMacrosConfiguration.ts'
import { TeX } from 'mathjax-full/ts/input/tex.ts'
import { mathjax } from 'mathjax-full/ts/mathjax.ts'
import { SVG } from 'mathjax-full/ts/output/svg.ts'

// Without `noundefined`, an unknown command is an error, as in LaTeX.
// `textmacros` reads \text{…} as LaTeX does: accents, $…$ and all.
const PACKAGES = ['base', 'ams', 'newcommand', 'boldsymbol', 'braket', 'mathtools', 'cancel', 'color', 'textmacros']

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
    root = tree(document.convert(tex, { display, em: 16, ex: 8, containerWidth: 1280 }))
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
