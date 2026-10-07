// The shared render pipeline: a job (LaTeX math or a typst block) in, a PNG on
// disk sized to a whole number of terminal cells out. The layout itself lives
// in texel.typ; this module builds each typst run, runs it and caches what it
// produced by content hash, on disk and in memory. Every consumer goes
// through `render`, and inline math first through `measureInline`.

/** What the pipeline needs from the host; the hooks module builds it from `$`. */
export type Io = {
  run: (argv: string[], stdin?: string) => Promise<{ exitCode: number; stdout: string; stderr: string }>
  exists: (path: string) => Promise<boolean>
  readText: (path: string) => Promise<string>
  writeText: (path: string, text: string) => Promise<void>
  readBase64: (path: string) => Promise<string>
}

/** The terminal's grid and font, in points, and how math is set on it. */
export type Theme = {
  /** Ink colours, hex without `#`: LaTeX math's, inline and display, and typst blocks'. */
  colors: { math: string; typst: string }
  cellWidth: number
  cellHeight: number
  /** The terminal font's x-height; math is sized to match it. */
  xHeight: number
  /** Where the baseline sits in a row, as a fraction of it from the top. */
  baseline: number
  /** Inline math's size: 1 matches the text's x-height. */
  inlineScale: number
}

/** A formula's ink at its natural size, in points: texel.typ's `ink`. */
export type Ink = { width: number; above: number; below: number }

/** Where an inline formula is drawn: its box in cells, its scale and offset. */
export type Placement = { columns: number; rows: number; scale: number; dy: number }

export type Job =
  /** LaTeX math in a line of prose, drawn as placed. */
  | { kind: 'inline'; tex: string; placement: Placement }
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
/** Why a run failed; `transient` when trying again could succeed. */
export type RenderFailure = { error: string; transient?: true }

const PPI = 216
// An Image covers at most 255 x 255 cells.
const MAX_CELLS = 255

const IMPORT = '#import "/texel.typ": *\n'

function mainSource(job: Job | 'ink') {
  if (job === 'ink') return `${IMPORT}#show: setup\n#inline-ink()\n`
  switch (job.kind) {
    case 'inline':
      return `${IMPORT}#show: setup\n#inline-latex()\n`
    case 'display':
      return `${IMPORT}#show: setup\n#display-math(latex(display: true))\n`
    case 'block':
      return `${IMPORT}#show: setup.with(ink: false)\n#typst-block[\n${job.typst}\n]\n`
  }
}

function themeInputs(theme: Theme, scale: number, foreground: string) {
  return {
    'cell-width': String(theme.cellWidth),
    'cell-height': String(theme.cellHeight),
    'x-height': String(theme.xHeight),
    baseline: String(theme.baseline),
    foreground,
    scale: String(scale),
  }
}

// The inputs a job compiles with, the transcript's width aside.
function jobInputs({ theme, macros }: Env, job: Job): Record<string, string> {
  switch (job.kind) {
    case 'inline': {
      const { columns, rows, scale, dy } = job.placement
      const fit = { 'fit-columns': String(columns), 'fit-rows': String(rows), 'fit-scale': String(scale), 'fit-dy': String(dy) }
      return { ...themeInputs(theme, theme.inlineScale, theme.colors.math), ...fit, tex: job.tex, macros }
    }
    case 'display':
      return { ...themeInputs(theme, 1, theme.colors.math), tex: job.tex, macros }
    case 'block':
      return themeInputs(theme, 1, theme.colors.typst)
  }
}

// Only a typst block is laid out against the width it may take; math is
// drawn the same at any width (inline at its placement, display as it is).
function inputs(env: Env, job: Job, maxColumns: number): Record<string, string> {
  const values = jobInputs(env, job)
  return job.kind === 'block' ? { ...values, 'max-columns': String(maxColumns) } : values
}

const memo = new Map<string, Promise<unknown>>()
// What each run settled to, read without waiting by `cached`.
const settled = new Map<string, unknown>()
// Blocks drawn at their natural size, by their job alone: reused at any
// width they still fit, so a resize redraws them without a compile.
const natural = new Map<string, Rendered>()
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

// One typst run's identity: the library, the main source and the inputs, so
// editing texel.typ redoes everything.
async function keyOf({ io, lib }: Env, source: string, values: Record<string, string>) {
  if (!libraries.has(lib)) libraries.set(lib, io.readText(`${lib}/texel.typ`))
  return hash(JSON.stringify([await libraries.get(lib), source, values]))
}

/**
 * Runs `work` once per distinct typst run and keeps what it settled to for the
 * session (successes on disk too, by `work`). Typst's own errors are kept as
 * well: the same source fails the same way, and a redraw must not compile it
 * again. Anything else (a process cut short, a file not there) is `transient`
 * and forgotten, so the next draw tries again.
 */
async function once<T extends object>(
  env: Env,
  source: string,
  values: Record<string, string>,
  work: (key: string, flags: string[]) => Promise<T | RenderFailure>,
): Promise<T | RenderFailure> {
  const key = await keyOf(env, source, values)
  const pending = memo.get(key) as Promise<T | RenderFailure> | undefined
  if (pending) return pending

  const flags = ['--root', env.lib, ...Object.entries(values).flatMap(([name, value]) => ['--input', `${name}=${value}`])]
  const job = work(key, flags)
    .catch((error: unknown): RenderFailure => ({ error: String(error), transient: true }))
    .then(result => {
      if (isFailure(result) && result.transient) memo.delete(key)
      else settled.set(key, result)
      return result
    })
  memo.set(key, job)
  return job
}

function failure(stderr: string): RenderFailure {
  return { error: stderr.trim().split('\n').slice(0, 6).join('\n') }
}

// Width and height from the PNG's IHDR chunk (bytes 16..24, big-endian).
async function pngSize(io: Io, file: string) {
  const head = atob((await io.readBase64(file)).slice(0, 44))
  const u32 = (at: number) =>
    ((head.charCodeAt(at) << 24) | (head.charCodeAt(at + 1) << 16) | (head.charCodeAt(at + 2) << 8) | head.charCodeAt(at + 3)) >>> 0
  return { width: u32(16), height: u32(20) }
}

async function toCells(io: Io, file: string, theme: Theme): Promise<Rendered | RenderFailure> {
  const { width, height } = await pngSize(io, file)
  const scale = PPI / 72
  const columns = Math.max(1, Math.round(width / (theme.cellWidth * scale)))
  const rows = Math.max(1, Math.round(height / (theme.cellHeight * scale)))
  // Shrunk to fit, a figure past the Image's limit would be a sliver.
  if (columns > MAX_CELLS || rows > MAX_CELLS) {
    return { error: `too large to show: ${columns} x ${rows} cells (an image holds ${MAX_CELLS} x ${MAX_CELLS})` }
  }
  return { file, columns, rows }
}

/** An inline formula's ink at its natural size, for fitting it into a line. */
export async function measureInline(env: Env, tex: string): Promise<Ink | RenderFailure> {
  const source = mainSource('ink')
  // Ink has no colour: one fixed here, so a new colour never measures again.
  const values = { ...themeInputs(env.theme, env.theme.inlineScale, '000000'), tex, macros: env.macros }
  return once<Ink>(env, source, values, async (key, flags) => {
    const file = `${await getCacheDir(env.io)}/${key}.ink.json`
    if (await env.io.exists(file)) return JSON.parse(await env.io.readText(file)) as Ink
    const result = await env.io.run(['typst', 'eval', ...flags, '--in', '-', 'query(<ink>).first().value'], source)
    if (result.exitCode !== 0) return failure(result.stderr)
    await env.io.writeText(file, result.stdout)
    return JSON.parse(result.stdout) as Ink
  })
}

/** Renders `job` into a PNG the terminal shows undistorted at `columns` x `rows`. */
export async function render(env: Env, job: Job, maxColumns: number): Promise<Rendered | RenderFailure> {
  const source = mainSource(job)
  const result = await once<Rendered>(env, source, inputs(env, job, maxColumns), async (key, flags) => {
    const file = `${await getCacheDir(env.io)}/${key}.png`
    if (!(await env.io.exists(file))) {
      const result = await env.io.run(['typst', 'compile', ...flags, '--ppi', String(PPI), '-', file], source)
      if (result.exitCode !== 0) return failure(result.stderr)
    }
    return toCells(env.io, file, env.theme)
  })
  // Narrower than it was allowed, it was drawn at its natural size.
  if (job.kind !== 'inline' && !isFailure(result) && result.columns < maxColumns) {
    natural.set(await keyOf(env, source, jobInputs(env, job)), result)
  }
  return result
}

/**
 * What `render` would answer without compiling anything: the same job at its
 * natural size if it still fits, else this run if it has settled or its PNG
 * is on disk; undefined when only a compile can tell.
 */
export async function cached(env: Env, job: Job, maxColumns: number): Promise<Rendered | RenderFailure | undefined> {
  const source = mainSource(job)
  const drawn = natural.get(await keyOf(env, source, jobInputs(env, job)))
  if (drawn && drawn.columns <= maxColumns) return drawn

  const key = await keyOf(env, source, inputs(env, job, maxColumns))
  const done = settled.get(key) as Rendered | RenderFailure | undefined
  if (done) return done
  const file = `${await getCacheDir(env.io)}/${key}.png`
  return (await env.io.exists(file)) ? toCells(env.io, file, env.theme) : undefined
}

export function isFailure(result: object): result is RenderFailure {
  return 'error' in result
}
