// What the view draws through. Two backends make pictures: MathJax for LaTeX,
// always, inside the hooks module; typst for typst blocks, only where typst
// is installed. `route` puts them behind one Renderer, which answers either
// from what is already known or by doing the work.

import type { Ink, Placement } from '../layout/geometry'
import type { Rendered, RenderFailure } from './result'

/** LaTeX math, inline (drawn as placed) or on its own. */
export type LatexJob = { kind: 'inline'; tex: string; placement: Placement } | { kind: 'display'; tex: string }

/** Typst markup, laid out at most `maxColumns` wide: a figure, or prose that wraps. */
export type TypstJob = { kind: 'typst'; typst: string; maxColumns: number }

export type DrawJob = LatexJob | TypstJob

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

/** A formula's ink and a job's picture; `Pending` stands where an answer is not ready. */
export type Answers<Pending> = {
  ink(tex: string): Promise<Ink | RenderFailure | Pending>
  picture(job: DrawJob): Promise<Rendered | RenderFailure | Pending>
}

export type Renderer = {
  /** Answers from what is already known; undefined where only a run can tell. */
  known: Answers<undefined>
  /** Answers by doing the work where it must. */
  fresh: Answers<never>
}

/** The typst backend where typst cannot run: every block fails with `failure`. */
export function unavailableTypst(failure: RenderFailure): TypstBackend {
  return { known: async () => failure, fresh: async () => failure }
}

/** LaTeX to `math`, typst blocks to `typst`. */
export function route(math: MathBackend, typst: TypstBackend): Renderer {
  return {
    known: { ink: tex => math.ink(tex), picture: job => (job.kind === 'typst' ? typst.known(job) : math.picture(job)) },
    fresh: { ink: tex => math.ink(tex), picture: job => (job.kind === 'typst' ? typst.fresh(job) : math.picture(job)) },
  }
}
