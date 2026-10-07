// texel's hooks: redraw assistant replies and the person's own prompts with
// their math and typst rendered. The only module that touches `$`: it gathers
// facts about the machine and Claude Code (host.ts and settings.ts decide what
// they mean), prepares what the view draws with, and hands it each message.

import type { EngineInterface, Register, RenderInput } from 'claude-code'

import { cacheDir, MIN_TYPST, pruneCommand, showsImages, themeFrom, typstFrom, type Machine, type TypstInstall } from './host'
import { gridFor } from './layout/geometry'
import { needsRender, parse } from './markdown/parse'
import { hash } from './render/hash'
import { Limiter } from './render/limit'
import { createRenderer, RenderCache, type Io } from './render/renderer'
import { cliCompiler, type Run } from './render/typst-cli'
import { readSettings, type Settings } from './settings'
import { drawMessage } from './view/message'
import type { ViewContext } from './view/parts'

// The folder of texel.typ and its packages, within the plugin.
const LIB = 'hooks/render'
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

// `promise`, forgotten through `forget` should it fail, so the next draw asks
// again rather than every draw failing until a reload.
function retried<T>(promise: Promise<T>, forget: () => void) {
  promise.catch(forget)
  return promise
}
let toldAboutTypst = false
const cache = new RenderCache()
// Typst processes at once, across every draw: a reply full of formulas queues rather than floods.
const typstSlots = new Limiter(4)

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

function files($: EngineInterface): Io {
  return {
    exists: path => $.fs.exists(path),
    readText: path => $.fs.read(path),
    writeText: (path, text) => $.fs.write(path, text),
    readBase64: async path => ((await $.fs.read(path, { as: 'bytes' })) as { base64: string }).base64,
    rename: async (from, to) => void (await $.process.run(['mv', '-f', from, to])),
  }
}

// Said once per load, when there is no typst texel can use.
function tellAboutTypst($: EngineInterface, typst: TypstInstall) {
  if (toldAboutTypst) return
  toldAboutTypst = true
  // typst is looked for once per load, so the way back is a reload.
  const fix = `install typst ${MIN_TYPST.join('.')} or newer, then /reload-plugins, to render math`
  $.ui.toast('missing' in typst ? `texel: typst not found; ${fix}` : `texel: typst ${typst.version} is too old; ${fix}`)
}

/**
 * What the view draws a message with, or undefined where texel leaves the
 * message to the engine: no pictures here, or no typst to make them.
 */
async function prepare(
  $: EngineInterface,
  e: RenderInput<'AssistantMessage' | 'UserMessage', 'terminal'>,
  settings: Settings,
): Promise<{ ctx: ViewContext; theme: Theme } | undefined> {
  if (settings.images === 'never') return undefined
  host ??= retried(learnHost($), () => (host = undefined))
  const { machine, typst, systemIsDark, library } = await host
  if (settings.images === 'auto' && !showsImages(machine)) return undefined
  if ('missing' in typst || !typst.isSupported) {
    tellAboutTypst($, typst)
    return undefined
  }

  theme ??= retried(
    $.config.list().then(rows => themeFrom(rows.find(row => row.key === 'theme')?.value, systemIsDark)),
    () => (theme = undefined),
  )
  const current = await theme
  const grid = gridFor(settings.font)
  const run: Run = (argv, stdin) => $.process.run(argv, { stdin, timeoutMs: 20_000 })
  const renderer = createRenderer({
    io: files($),
    compiler: cliCompiler({ run, limiter: typstSlots, lib: `${$.plugin.root}/${LIB}`, version: typst.version, library }),
    cache,
    cacheDir: cacheDir(machine),
    style: {
      grid,
      mathColor: settings.mathColor ?? TEXT[current],
      typstColor: settings.typstColor ?? TEXT[current],
      inlineScale: settings.inlineScale,
      // Read on every draw, so an edit to the file shows on the next redraw.
      macros: await $.fs.read(`${machine.home}/${MACROS}`).catch(() => ''),
    },
  })
  const ctx: ViewContext = {
    ui: $.ui.resolve(e),
    renderer,
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

  // A new theme: once it is written, read it again and draw every message in its colours.
  on('config.set', { key: 'theme' }, async ($, e, next) => {
    const result = await next(e)
    theme = undefined
    $.ui.invalidate('ui.render')
    return result
  })
}
