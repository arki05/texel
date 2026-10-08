// The part of MathJax texel bundles into the plugin (scripts/build-mathjax.mts):
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
import { TeX } from 'mathjax-full/js/input/tex.js'
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { SVG } from 'mathjax-full/js/output/svg.js'

// Without `noundefined`, an unknown command is an error, as in LaTeX.
const PACKAGES = ['base', 'ams', 'newcommand', 'boldsymbol', 'braket', 'mathtools', 'cancel', 'color']

export type SvgNode = { tag: string; attrs: Record<string, string>; children: SvgNode[] }
export type TexResult = SvgNode | { error: string }
export type Tex = { convert(tex: string, display: boolean): TexResult }

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)

function tree(node: unknown): SvgNode {
  const children = (adaptor.childNodes(node as never) as unknown[]).filter(child => adaptor.kind(child as never) !== '#text')
  const attrs: Record<string, string> = {}
  for (const { name, value } of adaptor.allAttributes(node as never)) attrs[name] = value
  return { tag: adaptor.kind(node as never), attrs, children: children.map(tree) }
}

function find(node: SvgNode, test: (n: SvgNode) => boolean): SvgNode | undefined {
  if (test(node)) return node
  for (const child of node.children) {
    const found = find(child, test)
    if (found) return found
  }
  return undefined
}

/**
 * A converter whose TeX knows `macros` (`\newcommand`s): they are defined once,
 * and stay defined for every formula it converts.
 */
export function createTex(macros: string): Tex {
  const document = mathjax.document('', {
    InputJax: new TeX({ packages: PACKAGES }),
    OutputJax: new SVG({ fontCache: 'none' }),
  })
  const convert = (tex: string, display: boolean): TexResult => {
    const root = tree(document.convert(tex, { display, em: 16, ex: 8, containerWidth: 1280 }))
    const svg = find(root, node => node.tag === 'svg')
    if (!svg) return { error: 'MathJax drew nothing' }
    const error = find(svg, node => node.attrs['data-mml-node'] === 'merror')
    return error ? { error: error.attrs['data-mjx-error'] ?? 'TeX error' } : svg
  }
  if (macros.trim()) {
    const defined = convert(macros, false)
    if ('error' in defined) return { convert: () => ({ error: `in your macros: ${defined.error}` }) }
  }
  return { convert }
}
