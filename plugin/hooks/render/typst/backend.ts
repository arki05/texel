// Typst blocks rendered by typst, in a process of its own. It decides what
// typst must run and has a Compiler run it, keeps every picture on disk by
// content hash and in a Memo, and answers from those whenever it can.

import { hash } from '../hash'
import { Memo } from './memo'
import { pngSize } from '../png'
import type { BlockRenderer, TypstBackend, TypstJob } from '../renderer'
import { isFailure, tooLarge, type Rendered, type RenderFailure } from '../result'
import type { Compiler } from './compiler'
import { importsPackage, program, widthFree, type Program, type TypstStyle } from './program'

/** The files the backend reads and writes; the hooks module builds it from `$`. */
export type Io = {
  exists: (path: string) => Promise<boolean>
  readBase64: (path: string) => Promise<string>
  /** Moves a finished file into place in one step. */
  rename: (from: string, to: string) => Promise<void>
}

/** What the typst backend keeps between draws, for as long as the module is loaded. */
export class TypstCache {
  /** Every run, by its key. */
  readonly runs = new Memo<Rendered>()
  /**
   * Blocks drawn at their natural size, by their width-free program's key:
   * reused at any width they fit, so a resize needs no new picture.
   */
  readonly natural = new Map<string, Rendered>()
}

export type TypstOptions = {
  io: Io
  compiler: Compiler
  cache: TypstCache
  style: TypstStyle
  /** Where pictures are kept. */
  cacheDir: string
  /** Whether a block may import packages, which typst downloads (the `typstPackages` setting). */
  allowPackages: boolean
}

const PACKAGES_OFF: RenderFailure = { error: 'it imports a package, and typstPackages is off in /config', skipped: true }

/**
 * Typst blocks drawn through `backend`, at most `maxWidth` columns wide: what
 * it already knows, at once; otherwise its run starts in the background and
 * `redraw` is called when it ends. A draw never waits on typst: a hook that
 * did could outlast its time and be drawn as plain source, with nothing to
 * draw it again.
 */
export function typstBlocks(backend: TypstBackend, maxWidth: number, redraw: () => void): BlockRenderer {
  return async (typst, maxColumns) => {
    const job = { typst, maxColumns: Math.min(maxColumns, maxWidth) }
    const ready = await backend.ready(job)
    if (ready) return ready
    void backend.render(job).then(redraw, redraw)
    return undefined
  }
}

export function createTypstBackend({ io, compiler, cache, style, cacheDir, allowPackages }: TypstOptions): TypstBackend {
  const refused = (job: TypstJob) => !allowPackages && importsPackage(job.typst)
  // A run is known by what makes its output: the compiler, its main file, its inputs.
  const keyOf = ({ source, inputs }: Program) => hash(JSON.stringify([compiler.id, source, inputs]))

  // A picture is made under a name of its own and moved into place when
  // whole, so a run cut short never leaves half a file under the real name,
  // and two sessions making the same picture never write into one another's.
  async function compileWhole(drawing: Program, file: string) {
    const part = `${file}.${Math.random().toString(36).slice(2)}.part`
    const failure = await compiler.compile(drawing, part)
    if (!failure) await io.rename(part, file)
    return failure
  }

  // A PNG as a picture of whole cells. Shrunk to fit, one past the Image's
  // limit would be a sliver, so that is a failure instead.
  async function pictureOf(file: string): Promise<Rendered | RenderFailure> {
    const { width, height } = pngSize(await io.readBase64(file))
    const points = compiler.ppi / 72
    const columns = Math.max(1, Math.round(width / (style.grid.cellWidth * points)))
    const rows = Math.max(1, Math.round(height / (style.grid.cellHeight * points)))
    return tooLarge(columns, rows) ?? { picture: { file }, columns, rows }
  }

  // Where a job's picture is: its program, the run's key and file, and the
  // key a picture at its natural size is kept under, whatever the width.
  async function locate(job: TypstJob) {
    const drawing = program(job, style)
    const key = await keyOf(drawing)
    return { drawing, key, file: `${cacheDir}/${key}.png`, naturalKey: await keyOf(widthFree(drawing)) }
  }

  // A block narrower than it was allowed was drawn at its natural size
  // (texel.typ lays out a block that fits at its own width, a cell to spare).
  function noteNatural(job: TypstJob, naturalKey: string, result: Rendered | RenderFailure) {
    if (!isFailure(result) && result.columns < job.maxColumns) cache.natural.set(naturalKey, result)
  }

  return {
    async ready(job) {
      if (refused(job)) return PACKAGES_OFF
      const { key, file, naturalKey } = await locate(job)
      const natural = cache.natural.get(naturalKey)
      if (natural && natural.columns <= job.maxColumns) return natural
      const settled = cache.runs.get(key)
      if (settled) return settled
      if (!(await io.exists(file))) return undefined
      const result = await pictureOf(file)
      cache.runs.settle(key, result)
      noteNatural(job, naturalKey, result)
      return result
    },

    async render(job) {
      if (refused(job)) return PACKAGES_OFF
      const { drawing, key, file, naturalKey } = await locate(job)
      const result = await cache.runs.once(key, async () => {
        if (!(await io.exists(file))) {
          const failure = await compileWhole(drawing, file)
          if (failure) return failure
        }
        return pictureOf(file)
      })
      noteNatural(job, naturalKey, result)
      return result
    },
  }
}
