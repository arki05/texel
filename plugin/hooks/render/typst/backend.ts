// Typst blocks rendered by typst, in a process of its own. It decides what
// typst must run and has a Compiler run it, keeps every picture on disk by
// content hash and in a Memo, and answers from those whenever it can.

import { hash } from '../hash'
import { Memo } from '../memo'
import { pngSize } from '../png'
import type { TypstBackend, TypstJob } from '../renderer'
import { isFailure, tooLarge, type Rendered, type RenderFailure } from '../result'
import type { Compiler } from './compiler'
import { program, widthFree, type Program, type TypstStyle } from './program'

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
  readonly runs = new Memo()
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
}

export function createTypstBackend({ io, compiler, cache, style, cacheDir }: TypstOptions): TypstBackend {
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

  // A PNG's size in cells. Shrunk to fit, one past the Image's limit would be
  // a sliver, so that is a failure instead.
  async function cells(file: string): Promise<Rendered | RenderFailure> {
    const { width, height } = pngSize(await io.readBase64(file))
    const points = compiler.ppi / 72
    const columns = Math.max(1, Math.round(width / (style.grid.cellWidth * points)))
    const rows = Math.max(1, Math.round(height / (style.grid.cellHeight * points)))
    return tooLarge(columns, rows) ?? { picture: { file }, columns, rows }
  }

  // A block narrower than it was allowed was drawn at its natural size
  // (texel.typ's typst-block draws a fitting figure at least a cell narrower).
  async function noteNatural(job: TypstJob, drawing: Program, result: Rendered | RenderFailure) {
    if (!isFailure(result) && result.columns < job.maxColumns) cache.natural.set(await keyOf(widthFree(drawing)), result)
  }

  return {
    async known(job) {
      const drawing = program(job, style)
      const natural = cache.natural.get(await keyOf(widthFree(drawing)))
      if (natural && natural.columns <= job.maxColumns) return natural
      const key = await keyOf(drawing)
      const settled = cache.runs.get<Rendered>(key)
      if (settled) return settled
      const file = `${cacheDir}/${key}.png`
      if (!(await io.exists(file))) return undefined
      const result = await cells(file)
      cache.runs.settle(key, result)
      await noteNatural(job, drawing, result)
      return result
    },

    async fresh(job) {
      const drawing = program(job, style)
      const key = await keyOf(drawing)
      const result = await cache.runs.once<Rendered>(key, async () => {
        const file = `${cacheDir}/${key}.png`
        if (!(await io.exists(file))) {
          const failure = await compileWhole(drawing, file)
          if (failure) return failure
        }
        return cells(file)
      })
      await noteNatural(job, drawing, result)
      return result
    },
  }
}
