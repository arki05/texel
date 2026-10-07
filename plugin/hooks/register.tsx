// texel's hooks: redraw assistant replies and the person's own prompts with
// their math and typst rendered. The only module that touches `$`: it gathers
// facts about the machine and Claude Code, leaves the decisions to terminal.ts
// and settings.ts, builds a renderer, and hands the row to the view.

import type { EngineInterface, Register, RenderInput } from 'claude-code'

import { needsRender, parse } from './markdown/parse'
import { createRenderer, pruneCache, RenderCache, type Io } from './render/renderer'
import { readSettings, type Settings } from './settings'
import { cacheDir, gridFor, MIN_TYPST, showsImages, themeFrom, typstFrom, type Machine, type Typst } from './terminal'
import { drawMessage } from './view/message'

// Personal LaTeX macros (`\newcommand`s), led into every formula; the model never sees them.
const MACROS = '.config/texel/macros.tex'
// Claude Code's own prompt-row background, and the text colour, per theme.
const PROMPT_BACKGROUND = { dark: 'rgb(55, 55, 55)', light: 'rgb(240, 240, 240)' }
const TEXT = { dark: 'e6e6e6', light: '1f1f1f' }
// The engine's gutter beside a reply (`⏺ `), and a column to spare.
const GUTTER = 4
// One fact a line, in Machine's order.
const FACTS = 'printf "%s\\n" "$HOME" "$(uname -s)" "$XDG_CACHE_HOME" "$TERM" "$TERM_PROGRAM" "$KITTY_WINDOW_ID" "$TMUX"'

/** What texel learns about the machine once per load. */
type Host = { machine: Machine; typst: Typst; systemIsDark: boolean }

let host: Promise<Host> | undefined
// Claude Code's theme, read again after the person changes it.
let theme: Promise<'dark' | 'light'> | undefined
let toldAboutTypst = false
const cache = new RenderCache()

async function learnHost($: EngineInterface): Promise<Host> {
  const [facts, version, appearance] = await Promise.all([
    $.process.run(['/bin/sh', '-c', FACTS]).then(r => r.stdout.split('\n')),
    $.process.run(['typst', '--version']).then(
      r => r.stdout,
      () => undefined,
    ),
    $.process.run(['defaults', 'read', '-g', 'AppleInterfaceStyle']).then(
      r => r.stdout.trim(),
      () => '',
    ),
  ])
  const [home = '', os = '', ...env] = facts
  const [XDG_CACHE_HOME, TERM, TERM_PROGRAM, KITTY_WINDOW_ID, TMUX] = env.map(value => value || undefined)
  const machine: Machine = { home, os, env: { XDG_CACHE_HOME, TERM, TERM_PROGRAM, KITTY_WINDOW_ID, TMUX } }
  // Off macOS there is no system appearance to ask; dark is the terminal norm.
  return { machine, typst: typstFrom(version), systemIsDark: os !== 'Darwin' || appearance === 'Dark' }
}

function io($: EngineInterface): Io {
  return {
    run: (argv, stdin) => $.process.run(argv, { stdin, timeoutMs: 20_000 }),
    exists: path => $.fs.exists(path),
    readText: path => $.fs.read(path),
    writeText: (path, text) => $.fs.write(path, text),
    readBase64: async path => ((await $.fs.read(path, { as: 'bytes' })) as { base64: string }).base64,
  }
}

// Said once per load, when there is no typst texel can use.
function tellAboutTypst($: EngineInterface, typst: Typst) {
  if (toldAboutTypst) return
  toldAboutTypst = true
  const needed = `typst ${MIN_TYPST.join('.')} or newer`
  $.ui.toast('missing' in typst ? `texel: typst not found; install ${needed} to render math` : `texel: typst ${typst.version} is too old; install ${needed} to render math`)
}

async function drawRow(
  $: EngineInterface,
  e: RenderInput<'AssistantMessage' | 'UserMessage', 'terminal'>,
  settings: Settings,
  isPrompt: boolean,
) {
  if (settings.images === 'never') return undefined
  const segments = parse(e.props.text)
  if (!needsRender(segments)) return undefined

  if (!host) {
    host = learnHost($)
    void host.then(({ machine }) => pruneCache(io($), cacheDir(machine)))
  }
  const { machine, typst, systemIsDark } = await host
  if (settings.images === 'auto' && !showsImages(machine)) return undefined
  if ('missing' in typst || !typst.isSupported) {
    tellAboutTypst($, typst)
    return undefined
  }

  theme ??= $.config.list().then(rows => themeFrom(rows.find(row => row.key === 'theme')?.value, systemIsDark))
  const colors = TEXT[await theme]
  const grid = gridFor(settings.font)
  const renderer = createRenderer({
    io: io($),
    cache,
    lib: `${$.plugin.root}/hooks/render`,
    cacheDir: cacheDir(machine),
    style: {
      grid,
      mathColor: settings.mathColor ?? colors,
      typstColor: settings.typstColor ?? colors,
      inlineScale: settings.inlineScale,
      // Read on every draw, so an edit to the file shows on the next redraw.
      macros: await $.fs.read(`${machine.home}/${MACROS}`).catch(() => ''),
    },
  })
  const ctx = {
    ui: $.ui.resolve(e),
    renderer,
    grid,
    fit: settings.fit,
    columns: (e.viewport?.columns ?? 100) - GUTTER,
    redraw: () => $.ui.invalidate('ui.render'),
  }
  return drawMessage(ctx, segments, isPrompt ? PROMPT_BACKGROUND[await theme] : undefined)
}

export const register: Register = (on, options) => {
  const settings = readSettings(options)

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.surface !== 'terminal') return next(e)
    return (await drawRow($, e, settings, false)) ?? next(e)
  })

  // The person's own prompts, typed in the composer.
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (e.surface !== 'terminal' || e.props.origin.kind !== 'composer') return next(e)
    return (await drawRow($, e, settings, true)) ?? next(e)
  })

  // A new theme: read it again on the next draw.
  on('config.set', { key: 'theme' }, ($, e, next) => {
    theme = undefined
    return next(e)
  })
}
