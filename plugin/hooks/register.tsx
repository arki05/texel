// texel's hooks: redraw assistant replies and the person's own prompts with
// their math and typst rendered, tell the model it may write math, and answer
// /texel. The only module that touches `$`: it gathers facts about the
// machine and Claude Code (host.ts and settings.ts decide what they mean),
// prepares what the view draws with, and hands it each message.

import { atom, read, update, type EngineInterface, type Register, type RenderInput } from 'claude-code'

import { cacheDir, pruneCommand, themeFrom, typstFrom, whyNoPictures, type Machine, type TypstStatus } from './host'
import { gridFor } from './geometry'
import { GUTTER, PROMPT_BACKGROUND, TEXT, type Theme } from './look'
import { needsRender, parse } from './markdown/parse'
import { noteText, PROMPT_SECTION } from './prompt'
import { hash } from './render/hash'
import { Limiter } from './render/typst/limit'
import { layoutMessage } from './layout/message'
import { createMathBackend, MathCache } from './render/mathjax/backend'
import type { BlockRenderer } from './render/renderer'
import { createTypstBackend, TypstCache, typstBlocks, type Io } from './render/typst/backend'
import { cliCompiler, type Run } from './render/typst/cli'
import type { TypstStyle } from './render/typst/program'
import { readSettings, type Settings } from './settings'
import { drawMessage } from './view/message'

// The folder of texel.typ, within the plugin.
const LIB = 'hooks/render/typst'
// Personal LaTeX macros (`\newcommand`s), led into every formula; the model never sees them.
const MACROS = '.config/texel/macros.tex'

/** What texel learns once per load: the machine, its typst, and texel.typ's fingerprint. */
type Host = { machine: Machine; typst: TypstStatus; systemIsDark: boolean; libraryHash: string }

let host: Promise<Host> | undefined
// Claude Code's theme, read again after the person changes it.
let theme: Promise<Theme> | undefined
// `/texel source`: every message shown as its source, for reading or copying.
// Session state, so a reload of texel (a change of settings) keeps it, and
// every message that read it is drawn again when it changes.
const showingSource = atom({ plugin: 'texel', key: 'showingSource' } as const, false)
const mathCache = new MathCache()
const typstCache = new TypstCache()
// Typst processes at once, across every draw: a reply full of blocks queues rather than floods.
const typstSlots = new Limiter(4)

// `promise`, forgotten through `forget` should it fail, so the next draw asks
// again rather than every draw failing until a reload.
function retried<T>(promise: Promise<T>, forget: () => void) {
  promise.catch(forget)
  return promise
}

// Every promise of `named` awaited at once, each answer under its name.
async function allOf<T extends Record<string, Promise<unknown>>>(named: T): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const entries = await Promise.all(Object.entries(named).map(async ([name, promise]) => [name, await promise] as const))
  return Object.fromEntries(entries) as { [K in keyof T]: Awaited<T[K]> }
}

// What a command printed, trimmed; undefined where it would not run.
const output = (run: Promise<{ stdout: string }>) =>
  run.then(
    result => result.stdout.trim(),
    () => undefined,
  )

async function learnHost($: EngineInterface): Promise<Host> {
  const { home, os, typst, appearance, libraryHash, ...env } = await allOf({
    home: $.env.get('HOME'),
    XDG_CACHE_HOME: $.env.get('XDG_CACHE_HOME'),
    TERM: $.env.get('TERM'),
    TERM_PROGRAM: $.env.get('TERM_PROGRAM'),
    KITTY_WINDOW_ID: $.env.get('KITTY_WINDOW_ID'),
    TMUX: $.env.get('TMUX'),
    os: output($.process.run(['uname', '-s'])),
    typst: output($.process.run(['typst', '--version'])),
    appearance: output($.process.run(['defaults', 'read', '-g', 'AppleInterfaceStyle'])),
    libraryHash: $.fs.read(`${$.plugin.root}/${LIB}/texel.typ`).then(hash),
  })
  const machine: Machine = { home: home ?? '', os: os ?? '', env }
  await $.process.run(['mkdir', '-p', cacheDir(machine)])
  // Before any draw: pruning alongside one could remove a picture it just found.
  await $.process.run(pruneCommand(cacheDir(machine)))
  // Off macOS there is no system appearance to ask; dark is the terminal norm.
  return { machine, typst: typstFrom(typst), systemIsDark: machine.os !== 'Darwin' || appearance === 'Dark', libraryHash }
}

function hostOf($: EngineInterface) {
  host ??= retried(learnHost($), () => (host = undefined))
  return host
}

// Claude Code's theme, light or dark, read once and again after it changes.
function themeOf($: EngineInterface, known: Host): Promise<Theme> {
  theme ??= retried(
    $.config.list().then(rows => themeFrom(rows.find(row => row.key === 'theme')?.value, known.systemIsDark)),
    () => (theme = undefined),
  )
  return theme
}

function files($: EngineInterface): Io {
  return {
    exists: path => $.fs.exists(path),
    readBase64: async path => (await $.fs.read(path, { as: 'bytes' })).base64,
    rename: async (from, to) => void (await $.process.run(['mv', '-f', from, to])),
  }
}

// Typst blocks: drawn by the typst installed, or, where texel cannot use
// it, not rendered, saying what it needs.
function typstRenderer($: EngineInterface, known: Host, style: TypstStyle, settings: Settings): BlockRenderer {
  if ('unavailable' in known.typst) {
    const failure = { error: known.typst.unavailable, skipped: true } as const
    return async () => failure
  }
  const { version } = known.typst
  const run: Run = (argv, stdin) => $.process.run(argv, { stdin, timeoutMs: 20_000 })
  const backend = createTypstBackend({
    io: files($),
    compiler: cliCompiler({ run, limiter: typstSlots, libDir: `${$.plugin.root}/${LIB}`, version, libraryHash: known.libraryHash }),
    cache: typstCache,
    cacheDir: cacheDir(known.machine),
    style,
    allowPackages: settings.typstPackages,
  })
  return typstBlocks(backend, settings.typstMaxWidth, () => $.ui.invalidate('ui.render'))
}

/**
 * A message drawn, or undefined where texel leaves it to the engine: nothing
 * in it to render, no pictures here, or sources asked for. A prompt is
 * painted as Claude Code paints its row, with a column of padding either side.
 */
async function draw($: EngineInterface, e: RenderInput<'AssistantMessage' | 'UserMessage', 'terminal'>, settings: Settings, isPrompt: boolean) {
  const segments = parse(e.props.text)
  if (!needsRender(segments)) return undefined
  if (await read($, showingSource)) return undefined
  const known = await hostOf($)
  if (whyNoPictures(settings.images, known.machine)) return undefined

  const current = await themeOf($, known)
  const grid = gridFor(settings.font)
  const macros = await $.fs.read(`${known.machine.home}/${MACROS}`).catch(() => '')
  const math = createMathBackend(mathCache, { grid, color: settings.mathColor ?? TEXT[current], inlineSize: settings.inlineSize, macros })
  const typst = typstRenderer($, known, { grid, color: settings.typstColor ?? TEXT[current] }, settings)
  const columns = (e.viewport?.columns ?? 100) - GUTTER - (isPrompt ? 2 : 0)
  const laid = await layoutMessage({ inline: math, blocks: { math: math.block, typst } }, segments, { grid, fit: settings.fit, columns })
  return drawMessage($.ui.resolve(e), laid, isPrompt ? PROMPT_BACKGROUND[current] : undefined)
}

// What `/texel` reports: what texel draws with here.
function status(settings: Settings, known: Host, sources: boolean) {
  const { typst } = known
  const why = whyNoPictures(settings.images, known.machine)
  return [
    why ? `not drawing here: ${why}` : 'drawing pictures in this terminal',
    '  LaTeX math: MathJax, built in',
    `  typst blocks: ${'version' in typst ? `typst ${typst.version}${settings.typstPackages ? '' : ', packages off'}` : `off, ${typst.unavailable}`}`,
    `  showing: ${sources ? 'sources; /texel source renders again' : 'rendered; /texel source shows sources'}`,
  ].join('\n')
}

export const register: Register = (on, options) => {
  const settings = readSettings(options)

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.surface !== 'terminal') return next(e)
    return (await draw($, e, settings, false)) ?? next(e)
  })

  // The person's own prompts, typed in the composer.
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (e.surface !== 'terminal' || e.props.origin.kind !== 'composer') return next(e)
    return (await draw($, e, settings, true)) ?? next(e)
  })

  // Tell the model it may write math, and typst blocks where typst can draw them.
  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    if (!settings.promptNote || !e.surfaces.includes('terminal')) return composed
    const known = await hostOf($)
    if (whyNoPictures(settings.images, known.machine)) return composed
    const typst = 'version' in known.typst
    const note = noteText({ typst, packages: settings.typstPackages, theme: await themeOf($, known) })
    const section = { id: PROMPT_SECTION, text: note, scope: 'session' as const }
    return { sections: [...composed.sections, section] }
  })

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'texel', description: 'What texel draws with; `source` shows sources instead', argumentHint: '[source]', immediate: true })
    return next(e)
  })

  on('command.run', { command: 'texel' }, async ($, e) => {
    if (e.args.trim().toLowerCase() === 'source') {
      const why = whyNoPictures(settings.images, (await hostOf($)).machine)
      if (why) return { text: `nothing to switch: texel is not drawing here (${why}), so every message shows as Claude Code draws it` }
      const sources = await update($, showingSource, shown => !shown)
      $.ui.status(sources ? 'texel: showing sources' : undefined)
      return { text: sources ? 'showing sources; /texel source renders again' : 'rendering again' }
    }
    return { text: status(settings, await hostOf($), await read($, showingSource)) }
  })

  // The change itself is passed on untouched; once it is written, texel
  // reads the theme again and draws every message in its colours.
  on('config.set', { key: 'theme' }, ($, e, next) => {
    const written = next(e)
    void written.finally(() => {
      theme = undefined
      $.ui.invalidate('ui.render')
    })
    return written
  }).catch((_, e, next) => next(e))
}
