// texel's hooks: redraw assistant replies and the person's own prompts with
// their math and typst rendered. The only module that touches `$`: it learns
// what it needs about the host, builds a renderer, and hands the row to the view.

import type { EngineInterface, Register, RenderInput } from 'claude-code'

import { needsRender, parse } from './markdown/parse'
import { createRenderer, RenderCache, type Io } from './render/renderer'
import type { Grid } from './render/typst'
import { readSettings, type Settings } from './settings'
import { drawMessage } from './view/message'

// Ghostty's default font, 13pt JetBrains Mono: a 7.8 x 17pt cell, an x-height
// of 0.55em, and its baseline 1.02em down a 1.32em line.
const TERMINAL: Grid = { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 }
// Personal LaTeX macros (`\newcommand`s), led into every formula; the model never sees them.
const MACROS = '.config/texel/macros.tex'
const CACHE = 'Library/Caches/texel'
// Claude Code's own prompt-row background, and the text colour, per theme.
const PROMPT_BACKGROUND = { dark: 'rgb(55, 55, 55)', light: 'rgb(240, 240, 240)' }
const TEXT = { dark: 'e6e6e6', light: '1f1f1f' }
// The engine's gutter beside a reply (`⏺ `), and a column to spare.
const GUTTER = 4

/** What texel learns about the host once per load. */
type Host = { home: string; theme: 'dark' | 'light' }

let host: Promise<Host> | undefined
const cache = new RenderCache()

async function learnHost($: EngineInterface): Promise<Host> {
  const [home, appearance] = await Promise.all([
    $.process.run(['/bin/sh', '-c', 'printf %s "$HOME"']).then(r => r.stdout),
    $.process.run(['defaults', 'read', '-g', 'AppleInterfaceStyle']).then(
      r => r.stdout.trim(),
      () => 'Dark',
    ),
  ])
  return { home, theme: appearance === 'Dark' ? 'dark' : 'light' }
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

async function drawRow(
  $: EngineInterface,
  e: RenderInput<'AssistantMessage' | 'UserMessage', 'terminal'>,
  settings: Settings,
  isPrompt: boolean,
) {
  const segments = parse(e.props.text)
  if (!needsRender(segments)) return undefined

  host ??= learnHost($)
  const { home, theme } = await host
  const renderer = createRenderer({
    io: io($),
    cache,
    lib: `${$.plugin.root}/hooks/render`,
    cacheDir: `${home}/${CACHE}`,
    style: {
      grid: TERMINAL,
      mathColor: settings.mathColor ?? TEXT[theme],
      typstColor: settings.typstColor ?? TEXT[theme],
      inlineScale: settings.inlineScale,
      // Read on every draw, so an edit to the file shows on the next redraw.
      macros: await $.fs.read(`${home}/${MACROS}`).catch(() => ''),
    },
  })
  const ctx = {
    ui: $.ui.resolve(e),
    renderer,
    grid: TERMINAL,
    fit: settings.fit,
    columns: (e.viewport?.columns ?? 100) - GUTTER,
    redraw: () => $.ui.invalidate('ui.render'),
  }
  return drawMessage(ctx, segments, isPrompt ? PROMPT_BACKGROUND[theme] : undefined)
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
}
