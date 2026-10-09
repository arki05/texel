// texel's hooks: redraw assistant replies and the person's own prompts with
// their math and typst rendered, tell the model it may write math, and answer
// /texel. The only module that touches `$`: it gathers facts about the
// machine and Claude Code (host.ts and settings.ts decide what they mean),
// prepares what the view draws with, and hands it each message.

import { atom, read, update, type EngineInterface, type Register, type RenderInput } from 'claude-code'

import { cacheDir, MIN_TYPST, pruneCommand, showsImages, themeFrom, typstFrom, type Machine, type TypstInstall } from './host'
import { gridFor } from './layout/geometry'
import { needsRender, parse } from './markdown/parse'
import { PROMPT_SECTION, promptNote } from './prompt'
import { hash } from './render/hash'
import { Limiter } from './render/limit'
import { createMathBackend, MathCache } from './render/mathjax/backend'
import { route, type TypstBackend } from './render/renderer'
import { createTypstBackend, TypstCache, type Io } from './render/typst/backend'
import { cliCompiler, type Run } from './render/typst/cli'
import type { TypstStyle } from './render/typst/program'
import { readSettings, type Settings } from './settings'
import { drawMessage } from './view/message'
import type { ViewContext } from './view/parts'

// The folder of texel.typ, within the plugin.
const LIB = 'hooks/render/typst'
// Personal LaTeX macros (`\newcommand`s), led into every formula; the model never sees them.
const MACROS = '.config/texel/macros.tex'
// Claude Code's own prompt-row background, and the text colour, per theme.
const PROMPT_BACKGROUND = { dark: 'rgb(55, 55, 55)', light: 'rgb(240, 240, 240)' }
const TEXT = { dark: 'e6e6e6', light: '1f1f1f' }
// The engine's gutter beside a reply (`⏺ `), and a column to spare.
const GUTTER = 4

type Theme = 'dark' | 'light'

/** What texel learns once per load: the machine, its typst, and texel.typ's fingerprint. */
type Host = { machine: Machine; typst: TypstInstall; systemIsDark: boolean; library: string }

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

async function learnHost($: EngineInterface): Promise<Host> {
  const [home, XDG_CACHE_HOME, TERM, TERM_PROGRAM, KITTY_WINDOW_ID, TMUX, os, version, appearance, library] = await Promise.all([
    $.env.get('HOME'),
    $.env.get('XDG_CACHE_HOME'),
    $.env.get('TERM'),
    $.env.get('TERM_PROGRAM'),
    $.env.get('KITTY_WINDOW_ID'),
    $.env.get('TMUX'),
    $.process.run(['uname', '-s']).then(
      r => r.stdout.trim(),
      () => '',
    ),
    $.process.run(['typst', '--version']).then(
      r => r.stdout,
      () => undefined,
    ),
    $.process.run(['defaults', 'read', '-g', 'AppleInterfaceStyle']).then(
      r => r.stdout.trim(),
      () => '',
    ),
    $.fs.read(`${$.plugin.root}/${LIB}/texel.typ`).then(hash),
  ])
  const machine: Machine = { home: home ?? '', os, env: { XDG_CACHE_HOME, TERM, TERM_PROGRAM, KITTY_WINDOW_ID, TMUX } }
  await $.process.run(['mkdir', '-p', cacheDir(machine)])
  // Before any draw: pruning alongside one could remove a picture it just found.
  await $.process.run(pruneCommand(cacheDir(machine)))
  // Off macOS there is no system appearance to ask; dark is the terminal norm.
  return { machine, typst: typstFrom(version), systemIsDark: os !== 'Darwin' || appearance === 'Dark', library }
}

function hostOf($: EngineInterface) {
  host ??= retried(learnHost($), () => (host = undefined))
  return host
}

// Whether texel draws pictures here: a terminal that shows them, unless set otherwise.
function draws(settings: Settings, { machine }: Host) {
  if (settings.images === 'never') return false
  return settings.images === 'always' || showsImages(machine)
}

const typstVersion = (typst: TypstInstall) => ('version' in typst && typst.isSupported ? typst.version : undefined)

function files($: EngineInterface): Io {
  return {
    exists: path => $.fs.exists(path),
    readBase64: async path => ((await $.fs.read(path, { as: 'bytes' })) as { base64: string }).base64,
    rename: async (from, to) => void (await $.process.run(['mv', '-f', from, to])),
  }
}

// The typst backend, where a typst texel can use is installed.
function typstBackend($: EngineInterface, known: Host, style: TypstStyle): TypstBackend | undefined {
  const version = typstVersion(known.typst)
  if (!version) return undefined
  const run: Run = (argv, stdin) => $.process.run(argv, { stdin, timeoutMs: 20_000 })
  return createTypstBackend({
    io: files($),
    compiler: cliCompiler({ run, limiter: typstSlots, lib: `${$.plugin.root}/${LIB}`, version, library: known.library }),
    cache: typstCache,
    cacheDir: cacheDir(known.machine),
    style,
  })
}

/**
 * What the view draws a message with, or undefined where texel leaves the
 * message to the engine: no pictures here, or sources asked for.
 */
async function prepare(
  $: EngineInterface,
  e: RenderInput<'AssistantMessage' | 'UserMessage', 'terminal'>,
  settings: Settings,
): Promise<{ ctx: ViewContext; theme: Theme } | undefined> {
  if (await read($, showingSource)) return undefined
  const known = await hostOf($)
  if (!draws(settings, known)) return undefined

  theme ??= retried(
    $.config.list().then(rows => themeFrom(rows.find(row => row.key === 'theme')?.value, known.systemIsDark)),
    () => (theme = undefined),
  )
  const current = await theme
  const grid = gridFor(settings.font)
  const macros = await $.fs.read(`${known.machine.home}/${MACROS}`).catch(() => '')
  const math = createMathBackend(mathCache, { grid, color: settings.mathColor ?? TEXT[current], inlineScale: settings.inlineScale, macros })
  const typst = typstBackend($, known, { grid, color: settings.typstColor ?? TEXT[current] })
  const needed = `typst ${MIN_TYPST.join('.')} or newer`
  const withoutTypst = { error: 'missing' in known.typst ? `needs ${needed}, which is not installed` : `needs ${needed}; this is typst ${known.typst.version}` }
  const ctx: ViewContext = {
    ui: $.ui.resolve(e),
    renderer: route(math, typst, withoutTypst),
    grid,
    fit: settings.fit,
    typstPackages: settings.typstPackages,
    columns: (e.viewport?.columns ?? 100) - GUTTER,
    redraw: () => $.ui.invalidate('ui.render'),
  }
  return { ctx, theme: current }
}

async function draw(
  $: EngineInterface,
  e: RenderInput<'AssistantMessage' | 'UserMessage', 'terminal'>,
  settings: Settings,
  isPrompt: boolean,
) {
  const segments = parse(e.props.text)
  if (!needsRender(segments)) return undefined
  const prepared = await prepare($, e, settings)
  if (!prepared) return undefined
  return drawMessage(prepared.ctx, segments, isPrompt ? PROMPT_BACKGROUND[prepared.theme] : undefined)
}

// What `/texel` reports: what texel draws with here.
function status(settings: Settings, known: Host, sources: boolean) {
  const version = typstVersion(known.typst)
  return [
    draws(settings, known) ? 'drawing pictures in this terminal' : 'not drawing here (no kitty graphics, or images set to never)',
    '  LaTeX math: MathJax, built in',
    `  typst blocks: ${version ? `typst ${version}` : `off, needs typst ${MIN_TYPST.join('.')} or newer`}`,
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
    if (!draws(settings, known)) return composed
    const section = { id: PROMPT_SECTION, text: promptNote({ typst: Boolean(typstVersion(known.typst)) }), scope: 'session' as const }
    return { sections: [...composed.sections, section] }
  })

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'texel', description: 'What texel draws with; `source` shows sources instead', argumentHint: '[source]', immediate: true })
    return next(e)
  })

  on('command.run', { command: 'texel' }, async ($, e) => {
    if (e.args.trim().toLowerCase() === 'source') {
      const sources = await update($, showingSource, shown => !shown)
      $.ui.status(sources ? 'texel: showing sources' : undefined)
      return { text: sources ? 'showing sources; /texel source renders again' : 'rendering again' }
    }
    return { text: status(settings, await hostOf($), await read($, showingSource)) }
  })

  // A new theme: once it is written, read it again and draw every message in its colours.
  on('config.set', { key: 'theme' }, async ($, e, next) => {
    const result = await next(e)
    theme = undefined
    $.ui.invalidate('ui.render')
    return result
  })
}
