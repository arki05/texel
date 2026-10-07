import type { EngineInterface, PluginOptions, Register, RenderInput } from 'claude-code'

import { DEFAULT_FIT, type FitOptions } from './math/fit'
import { draw } from './math/view'
import { needsRender, parse } from './math/parse'
import type { Env } from './render/pipeline'

// Ghostty's default font, 13pt JetBrains Mono: a 7.8 x 17pt cell, an x-height
// of 0.55em, and its baseline 1.02em down a 1.32em line.
const TERMINAL = { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 }
// Personal LaTeX macros (`\newcommand`s), led into every formula; the model never sees them.
const MACROS = '.config/texel/macros.tex'
// Claude Code's own prompt-row background, per theme.
const PROMPT_BACKGROUND = { dark: 'rgb(55, 55, 55)', light: 'rgb(240, 240, 240)' }

/**
 * The person's settings, from plugin.json's `userConfig` (shown in /config).
 * A colour left unset follows the theme's text colour.
 */
type Settings = { colors: { math?: string; typst?: string }; inlineSize: number; fit: FitOptions }

// A setting's number, held to a range that cannot break the layout.
function setting(options: PluginOptions, name: string, fallback: number, min: number, max: number) {
  const value = Number(options[name] ?? fallback)
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

// A setting's colour as six hex digits; anything else counts as unset.
function color(options: PluginOptions, name: string) {
  return /^#?([0-9a-f]{6})$/i.exec(String(options[name] ?? '').trim())?.[1]?.toLowerCase()
}

function readSettings(options: PluginOptions): Settings {
  return {
    colors: { math: color(options, 'mathColor'), typst: color(options, 'typstColor') },
    inlineSize: setting(options, 'inlineSize', 1.2, 0.5, 3),
    fit: {
      maxScale: setting(options, 'inlineMaxScale', DEFAULT_FIT.maxScale, 1, 3),
      minScale: setting(options, 'inlineMinScale', DEFAULT_FIT.minScale, 0.1, 1),
      shiftUp: setting(options, 'inlineShiftUp', DEFAULT_FIT.shiftUp, 0, 1),
      shiftDown: setting(options, 'inlineShiftDown', DEFAULT_FIT.shiftDown, 0, 1),
    },
  }
}

let isDark: Promise<boolean> | undefined
let home: Promise<string> | undefined

async function drawText(
  $: EngineInterface,
  e: RenderInput<'AssistantMessage' | 'UserMessage', 'terminal'>,
  settings: Settings,
  isPrompt = false,
) {
  const segments = parse(e.props.text)
  if (!needsRender(segments)) return undefined

  isDark ??= $.process.run(['defaults', 'read', '-g', 'AppleInterfaceStyle']).then(
    r => r.stdout.trim() === 'Dark',
    () => true,
  )
  home ??= $.process.run(['/bin/sh', '-c', 'printf %s "$HOME"']).then(r => r.stdout)
  const dark = await isDark
  const text = dark ? 'e6e6e6' : '1f1f1f'

  const env: Env = {
    io: {
      run: (argv, stdin) => $.process.run(argv, { stdin, timeoutMs: 20_000 }),
      exists: path => $.fs.exists(path),
      readText: path => $.fs.read(path),
      writeText: (path, text) => $.fs.write(path, text),
      readBase64: async path => ((await $.fs.read(path, { as: 'bytes' })) as { base64: string }).base64,
    },
    lib: `${$.plugin.root}/hooks/render`,
    theme: {
      ...TERMINAL,
      inlineScale: settings.inlineSize,
      colors: { math: settings.colors.math ?? text, typst: settings.colors.typst ?? text },
    },
    // Read on every draw, so an edit to the file shows on the next redraw.
    macros: await $.fs.read(`${await home}/${MACROS}`).catch(() => ''),
  }
  const background = isPrompt ? PROMPT_BACKGROUND[dark ? 'dark' : 'light'] : undefined
  return draw(env, $.ui.resolve(e), segments, {
    columns: (e.viewport?.columns ?? 100) - 4,
    fit: settings.fit,
    redraw: () => $.ui.invalidate('ui.render'),
    background,
  })
}

export const register: Register = (on, options) => {
  const settings = readSettings(options)

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.surface !== 'terminal') return next(e)
    return (await drawText($, e, settings)) ?? next(e)
  })

  // The person's own prompts, typed in the composer.
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (e.surface !== 'terminal' || e.props.origin.kind !== 'composer') return next(e)
    return (await drawText($, e, settings, true)) ?? next(e)
  })
}
