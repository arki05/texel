// Runs texel's typst programs and remembers what they produced: each PNG or
// measurement on disk by content hash, and every run in memory for as long as
// the module is loaded. Every consumer draws through a Renderer.

import { pngSize } from './png'
import { compileCommand, measureCommand, PPI, program, widthFree, type Ink, type Job, type Program, type Style } from './typst'

/** What a renderer needs from the host; the hooks module builds it from `$`. */
export type Io = {
  run: (argv: string[], stdin?: string) => Promise<{ exitCode: number; stdout: string; stderr: string }>
  exists: (path: string) => Promise<boolean>
  readText: (path: string) => Promise<string>
  writeText: (path: string, text: string) => Promise<void>
  readBase64: (path: string) => Promise<string>
}

export type Rendered = { file: string; columns: number; rows: number }

/** Why a run failed; `transient` when trying again could succeed. */
export type RenderFailure = { error: string; transient?: true }

export function isFailure(result: object): result is RenderFailure {
  return 'error' in result
}

/** A job that draws a PNG: every kind but measuring. */
export type DrawJob = Exclude<Job, { kind: 'ink' }>

export type Renderer = {
  /** An inline formula's ink at its natural size. */
  measure(tex: string): Promise<Ink | RenderFailure>
  /** `job` as a PNG of whole cells; `maxColumns` is the width a block lays out against. */
  render(job: DrawJob, maxColumns: number): Promise<Rendered | RenderFailure>
  /** What `render` would answer without running typst; undefined when only a run can tell. */
  peek(job: DrawJob, maxColumns: number): Promise<Rendered | RenderFailure | undefined>
}

/** What renderers share between draws, for as long as the module is loaded. */
export class RenderCache {
  /** Runs by key: in flight, or settled to a success or to typst's own error. */
  readonly runs = new Map<string, Promise<unknown>>()
  /** What each run settled to, read without waiting. */
  readonly settled = new Map<string, unknown>()
  /** Blocks drawn at their natural size, by their width-free program: reused at any width they fit. */
  readonly natural = new Map<string, Rendered>()
  library?: Promise<string>
  directory?: Promise<unknown>
}

export type RendererOptions = {
  io: Io
  cache: RenderCache
  style: Style
  /** The folder holding texel.typ: every run's root. */
  lib: string
  /** Where PNGs and measurements are kept. */
  cacheDir: string
}

// An Image covers at most 255 x 255 cells.
const MAX_CELLS = 255

async function hash(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Typst's own error: its first lines. */
function complaint(stderr: string): RenderFailure {
  return { error: stderr.trim().split('\n').slice(0, 6).join('\n') }
}

export function createRenderer({ io, cache, style, lib, cacheDir }: RendererOptions): Renderer {
  // A run is known by the library, its main file and its inputs, so editing
  // texel.typ redoes everything.
  async function keyOf({ source, inputs }: Program) {
    cache.library ??= io.readText(`${lib}/texel.typ`)
    return hash(JSON.stringify([await cache.library, source, inputs]))
  }

  async function pathOf(key: string, extension: string) {
    cache.directory ??= io.run(['mkdir', '-p', cacheDir])
    await cache.directory
    return `${cacheDir}/${key}.${extension}`
  }

  // Runs `work` once per key and keeps what it settled to. Typst's own errors
  // are kept too: the same source fails the same way, and a redraw must not
  // run it again. Anything else (a process cut short) is forgotten, so the
  // next draw tries again.
  function once<T extends object>(key: string, work: () => Promise<T | RenderFailure>): Promise<T | RenderFailure> {
    const running = cache.runs.get(key) as Promise<T | RenderFailure> | undefined
    if (running) return running
    const run = work()
      .catch((error: unknown): RenderFailure => ({ error: String(error), transient: true }))
      .then(result => {
        if (isFailure(result) && result.transient) cache.runs.delete(key)
        else cache.settled.set(key, result)
        return result
      })
    cache.runs.set(key, run)
    return run
  }

  // A PNG's size in cells. Shrunk to fit, one past the Image's limit would be
  // a sliver, so that is a failure instead.
  async function cells(file: string): Promise<Rendered | RenderFailure> {
    const { width, height } = pngSize(await io.readBase64(file))
    const points = PPI / 72
    const columns = Math.max(1, Math.round(width / (style.grid.cellWidth * points)))
    const rows = Math.max(1, Math.round(height / (style.grid.cellHeight * points)))
    if (columns > MAX_CELLS || rows > MAX_CELLS) {
      return { error: `too large to show: ${columns} x ${rows} cells (an image holds ${MAX_CELLS} x ${MAX_CELLS})` }
    }
    return { file, columns, rows }
  }

  return {
    async measure(tex) {
      const ink = program({ kind: 'ink', tex }, style, 0)
      const key = await keyOf(ink)
      return once<Ink>(key, async () => {
        const file = await pathOf(key, 'ink.json')
        if (await io.exists(file)) return JSON.parse(await io.readText(file)) as Ink
        const run = await io.run(measureCommand(lib, ink), ink.source)
        if (run.exitCode !== 0) return complaint(run.stderr)
        await io.writeText(file, run.stdout)
        return JSON.parse(run.stdout) as Ink
      })
    },

    async render(job, maxColumns) {
      const drawing = program(job, style, maxColumns)
      const key = await keyOf(drawing)
      const result = await once<Rendered>(key, async () => {
        const file = await pathOf(key, 'png')
        if (!(await io.exists(file))) {
          const run = await io.run(compileCommand(lib, drawing, file), drawing.source)
          if (run.exitCode !== 0) return complaint(run.stderr)
        }
        return cells(file)
      })
      // A block narrower than it was allowed was drawn at its natural size.
      if (job.kind === 'block' && !isFailure(result) && result.columns < maxColumns) {
        cache.natural.set(await keyOf(widthFree(drawing)), result)
      }
      return result
    },

    async peek(job, maxColumns) {
      const drawing = program(job, style, maxColumns)
      const natural = cache.natural.get(await keyOf(widthFree(drawing)))
      if (natural && natural.columns <= maxColumns) return natural
      const key = await keyOf(drawing)
      const settled = cache.settled.get(key) as Rendered | RenderFailure | undefined
      if (settled) return settled
      const file = await pathOf(key, 'png')
      return (await io.exists(file)) ? cells(file) : undefined
    },
  }
}
