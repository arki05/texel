// The shared render pipeline: a job (LaTeX math or a typst block) in, a PNG on
// disk sized to a whole number of terminal cells out. The layout itself lives
// in texel.typ; this module builds the compile, runs it and caches the result
// by content hash, on disk and in memory. Every consumer goes through `render`.

/** What the pipeline needs from the host; the hooks module builds it from `$`. */
export type Io = {
  run: (argv: string[], stdin?: string) => Promise<{ exitCode: number; stdout: string; stderr: string }>
  exists: (path: string) => Promise<boolean>
  readText: (path: string) => Promise<string>
  readBase64: (path: string) => Promise<string>
}

/** The terminal's grid and font, in points, and how math is set on it. */
export type Theme = {
  /** Text colour, hex without `#`. */
  foreground: string
  cellWidth: number
  cellHeight: number
  /** The terminal font's x-height; math is sized to match it. */
  xHeight: number
  /** Where the baseline sits in a row, as a fraction of it from the top. */
  baseline: number
  /** Inline math's size: 1 matches the text's x-height. */
  inlineScale: number
}

export type Job =
  /** LaTeX math in a line of prose; `display` style takes a row above and below. */
  | { kind: 'inline'; tex: string; style: 'text' | 'display' }
  /** LaTeX math on its own. */
  | { kind: 'display'; tex: string }
  /** Typst markup: a figure, or prose that wraps at the transcript's width. */
  | { kind: 'block'; typst: string }

export type Env = {
  io: Io
  /** The folder holding texel.typ: the compile's root. */
  lib: string
  theme: Theme
  /** The person's LaTeX macros, led into every formula. */
  macros: string
}

export type Rendered = { file: string; columns: number; rows: number }
export type RenderFailure = { error: string }

const PPI = 216
// An Image covers at most 255 x 255 cells.
const MAX_CELLS = 255

const IMPORT = '#import "/texel.typ": *\n'

function mainSource(job: Job) {
  switch (job.kind) {
    case 'inline':
      return `${IMPORT}#show: setup\n#inline-latex()\n`
    case 'display':
      return `${IMPORT}#show: setup\n#display-math(latex(display: true))\n`
    case 'block':
      return `${IMPORT}#show: setup.with(ink: false)\n#typst-block[\n${job.typst}\n]\n`
  }
}

function inputs({ theme, macros }: Env, job: Job, maxColumns: number): Record<string, string> {
  const shared = {
    'cell-width': String(theme.cellWidth),
    'cell-height': String(theme.cellHeight),
    'x-height': String(theme.xHeight),
    baseline: String(theme.baseline),
    foreground: theme.foreground,
    scale: String(job.kind === 'inline' ? theme.inlineScale : 1),
    'max-columns': String(maxColumns),
  }
  switch (job.kind) {
    case 'inline':
      return { ...shared, tex: job.tex, style: job.style, macros }
    case 'display':
      return { ...shared, tex: job.tex, macros }
    case 'block':
      return shared
  }
}

const inFlight = new Map<string, Promise<Rendered | RenderFailure>>()
const libraries = new Map<string, Promise<string>>()
let cacheDir: Promise<string> | undefined

async function getCacheDir(io: Io) {
  cacheDir ??= (async () => {
    const { stdout } = await io.run(['/bin/sh', '-c', 'printf %s "$HOME"'])
    const dir = `${stdout}/Library/Caches/texel`
    await io.run(['mkdir', '-p', dir])
    return dir
  })()
  return cacheDir
}

async function hash(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Width and height from the PNG's IHDR chunk (bytes 16..24, big-endian).
async function pngSize(io: Io, file: string) {
  const head = atob((await io.readBase64(file)).slice(0, 44))
  const u32 = (at: number) =>
    ((head.charCodeAt(at) << 24) | (head.charCodeAt(at + 1) << 16) | (head.charCodeAt(at + 2) << 8) | head.charCodeAt(at + 3)) >>> 0
  return { width: u32(16), height: u32(20) }
}

async function toCells(io: Io, file: string, theme: Theme): Promise<Rendered> {
  const { width, height } = await pngSize(io, file)
  const scale = PPI / 72
  const columns = Math.max(1, Math.round(width / (theme.cellWidth * scale)))
  const rows = Math.max(1, Math.round(height / (theme.cellHeight * scale)))
  // Past the Image's limit, shrink both evenly.
  const fit = Math.min(1, MAX_CELLS / columns, MAX_CELLS / rows)
  return { file, columns: Math.max(1, Math.floor(columns * fit)), rows: Math.max(1, Math.floor(rows * fit)) }
}

async function compile(env: Env, source: string, values: Record<string, string>, file: string) {
  const flags = Object.entries(values).flatMap(([name, value]) => ['--input', `${name}=${value}`])
  const argv = ['typst', 'compile', '--root', env.lib, ...flags, '--ppi', String(PPI), '-', file]
  const result = await env.io.run(argv, source)
  return result.exitCode === 0 ? null : { error: result.stderr.trim().split('\n').slice(0, 6).join('\n') }
}

/** Renders `job` into a PNG the terminal shows undistorted at `columns` x `rows`. */
export async function render(env: Env, job: Job, maxColumns: number): Promise<Rendered | RenderFailure> {
  const { io, lib, theme } = env
  const source = mainSource(job)
  const values = inputs(env, job, maxColumns)
  if (!libraries.has(lib)) libraries.set(lib, io.readText(`${lib}/texel.typ`))
  // The library is part of the key, so editing it re-renders everything.
  const key = await hash(JSON.stringify([await libraries.get(lib), source, values]))

  const pending = inFlight.get(key)
  if (pending) return pending

  const work = (async (): Promise<Rendered | RenderFailure> => {
    const file = `${await getCacheDir(io)}/${key}.png`
    if (!(await io.exists(file))) {
      const failure = await compile(env, source, values, file)
      if (failure) return failure
    }
    return toCells(io, file, theme)
  })().catch((error: unknown) => ({ error: String(error) }))

  inFlight.set(key, work)
  const result = await work
  // Keep successes memoised; let failures retry on the next draw.
  if (isFailure(result)) inFlight.delete(key)
  return result
}

export function isFailure(result: Rendered | RenderFailure): result is RenderFailure {
  return 'error' in result
}
