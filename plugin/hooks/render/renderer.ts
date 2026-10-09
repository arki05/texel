// What the view draws through: two backends that make pictures. MathJax, for
// LaTeX, runs inside the hooks module and answers at once; typst, for typst
// blocks, runs as a process of its own, so it answers from what it has
// already made or does the work, which the view starts and does not wait on.

import type { Ink, Placement } from '../geometry'
import type { Rendered, RenderFailure } from './result'

/** LaTeX math, inline (drawn as placed) or on its own. */
export type LatexJob = { kind: 'inline'; tex: string; placement: Placement } | { kind: 'display'; tex: string }

/** Typst markup, laid out at most `maxColumns` wide: a figure, or prose that wraps. */
export type TypstJob = { kind: 'typst'; typst: string; maxColumns: number }

/** LaTeX in the hooks module: quick enough to answer every time, so it never defers. */
export type MathBackend = {
  ink(tex: string): Promise<Ink | RenderFailure>
  picture(job: LatexJob): Promise<Rendered | RenderFailure>
}

/** Typst in a process of its own: answers from what it already made, or runs. */
export type TypstBackend = {
  known(job: TypstJob): Promise<Rendered | RenderFailure | undefined>
  fresh(job: TypstJob): Promise<Rendered | RenderFailure>
}
