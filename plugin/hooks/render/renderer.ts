// Turns jobs into pictures and measurements. It decides what typst must run
// and has a Compiler run it, keeps every result on disk by content hash and in
// a Memo, and answers from those whenever it can. Every consumer draws through
// a Renderer.

import type { Ink } from '../layout/geometry'
import type { Compiler } from './compiler'
import { hash } from './hash'
import { Memo } from './memo'
import { pngSize } from './png'
import { isFailure, type Rendered, type RenderFailure } from './result'
import { program, widthFree, type DrawJob, type Program, type Style } from './typst'

/** The files a renderer reads and writes; the hooks module builds it from `$`. */
export type Io = {
  exists: (path: string) => Promise<boolean>
  readText: (path: string) => Promise<string>
  writeText: (path: string, text: string) => Promise<void>
  readBase64: (path: string) => Promise<string>
  /** Moves a finished file into place in one step. */
  rename: (from: string, to: string) => Promise<void>
}

/** A formula's ink and a job's picture; `Pending` stands where an answer is not ready. */
export type Answers<Pending> = {
  ink(tex: string): Promise<Ink | RenderFailure | Pending>
  picture(job: DrawJob): Promise<Rendered | RenderFailure | Pending>
}

export type Renderer = {
  /** Answers from what is already known, in memory or on disk; undefined where only typst can tell. */
  known: Answers<undefined>
  /** Answers by running typst where it must. */
  fresh: Answers<never>
}

/** What renderers share between draws, for as long as the module is loaded. */
export class RenderCache {
  /** Every run, by its key. */
  readonly runs = new Memo()
  /**
   * Typst blocks drawn at their natural size, by their width-free program's
   * key: reused at any width they fit, so a resize needs no new picture.
   */
  readonly natural = new Map<string, Rendered>()
}

export type RendererOptions = {
  io: Io
  compiler: Compiler
  cache: RenderCache
  style: Style
  /** Where pictures and measurements are kept. */
  cacheDir: string
}

// An Image covers at most 255 x 255 cells.
const MAX_CELLS = 255

export function createRenderer({ io, compiler, cache, style, cacheDir }: RendererOptions): Renderer {
  // A run is known by what makes its output: the compiler, its main file, its inputs.
  const keyOf = ({ source, inputs }: Program) => hash(JSON.stringify([compiler.id, source, inputs]))

  // A stored measurement; one that does not parse is measured again.
  async function readInk(file: string) {
    if (!(await io.exists(file))) return undefined
    try {
      return JSON.parse(await io.readText(file)) as Ink
    } catch {
      return undefined
    }
  }

  // Files are made under a name of their own and moved into place when
  // whole, so a run cut short never leaves half a file under the real name,
  // and two sessions making the same file never write into one another's.
  async function writeWhole(file: string, make: (part: string) => Promise<RenderFailure | undefined>) {
    const part = `${file}.${Math.random().toString(36).slice(2)}.part`
    const failure = await make(part)
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
    if (columns > MAX_CELLS || rows > MAX_CELLS) {
      return { error: `too large to show: ${columns} x ${rows} cells (an image holds ${MAX_CELLS} x ${MAX_CELLS})` }
    }
    return { file, columns, rows }
  }

  // A typst block narrower than it was allowed was drawn at its natural size
  // (texel.typ's typst-block draws a fitting figure at least a cell narrower).
  async function noteNatural(job: DrawJob, drawing: Program, result: Rendered | RenderFailure) {
    if (job.kind === 'typst' && !isFailure(result) && result.columns < job.maxColumns) {
      cache.natural.set(await keyOf(widthFree(drawing)), result)
    }
  }

  const known: Answers<undefined> = {
    async ink(tex) {
      const key = await keyOf(program({ kind: 'ink', tex }, style))
      const settled = cache.runs.get<Ink>(key)
      if (settled) return settled
      const ink = await readInk(`${cacheDir}/${key}.ink.json`)
      if (ink) cache.runs.settle(key, ink)
      return ink
    },

    async picture(job) {
      const drawing = program(job, style)
      if (job.kind === 'typst') {
        const natural = cache.natural.get(await keyOf(widthFree(drawing)))
        if (natural && natural.columns <= job.maxColumns) return natural
      }
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
  }

  const fresh: Answers<never> = {
    async ink(tex) {
      const measuring = program({ kind: 'ink', tex }, style)
      const key = await keyOf(measuring)
      return cache.runs.once<Ink>(key, async () => {
        const file = `${cacheDir}/${key}.ink.json`
        const stored = await readInk(file)
        if (stored) return stored
        const ink = await compiler.measure(measuring)
        if (!isFailure(ink)) await writeWhole(file, async part => void (await io.writeText(part, JSON.stringify(ink))))
        return ink
      })
    },

    async picture(job) {
      const drawing = program(job, style)
      const key = await keyOf(drawing)
      const result = await cache.runs.once<Rendered>(key, async () => {
        const file = `${cacheDir}/${key}.png`
        if (!(await io.exists(file))) {
          const failure = await writeWhole(file, part => compiler.compile(drawing, part))
          if (failure) return failure
        }
        return cells(file)
      })
      await noteNatural(job, drawing, result)
      return result
    },
  }

  return { known, fresh }
}
