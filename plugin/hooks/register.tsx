import type { EngineInterface, Register, RenderInput } from 'claude-code'

import { draw } from './math/view'
import { needsRender, parse } from './math/parse'
import type { Env, Theme } from './render/pipeline'

// Ghostty's default font, 13pt JetBrains Mono: a 7.8 x 17pt cell, an x-height
// of 0.55em, and its baseline 1.02em down a 1.32em line.
const TERMINAL = { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 }
// Inline math's size: 1 matches the text's x-height; larger reads better in a cell grid.
const INLINE_SCALE = 1.2
// Personal LaTeX macros (`\newcommand`s), led into every formula; the model never sees them.
const MACROS = '.config/texel/macros.tex'
// Claude Code's own prompt-row background, per theme.
const PROMPT_BACKGROUND = { dark: 'rgb(55, 55, 55)', light: 'rgb(240, 240, 240)' }

let isDark: Promise<boolean> | undefined
let home: Promise<string> | undefined

async function drawText(
  $: EngineInterface,
  e: RenderInput<'AssistantMessage' | 'UserMessage', 'terminal'>,
  text: string,
  isPrompt = false,
) {
  const segments = parse(text)
  if (!needsRender(segments)) return undefined

  isDark ??= $.process.run(['defaults', 'read', '-g', 'AppleInterfaceStyle']).then(
    r => r.stdout.trim() === 'Dark',
    () => true,
  )
  home ??= $.process.run(['/bin/sh', '-c', 'printf %s "$HOME"']).then(r => r.stdout)
  const dark = await isDark

  const env: Env = {
    io: {
      run: (argv, stdin) => $.process.run(argv, { stdin, timeoutMs: 20_000 }),
      exists: path => $.fs.exists(path),
      readText: path => $.fs.read(path),
      readBase64: async path => ((await $.fs.read(path, { as: 'bytes' })) as { base64: string }).base64,
    },
    lib: `${$.plugin.root}/hooks/render`,
    theme: { ...TERMINAL, inlineScale: INLINE_SCALE, foreground: dark ? 'e6e6e6' : '1f1f1f' },
    // Read on every draw, so an edit to the file shows on the next redraw.
    macros: await $.fs.read(`${await home}/${MACROS}`).catch(() => ''),
  }
  const background = isPrompt ? PROMPT_BACKGROUND[dark ? 'dark' : 'light'] : undefined
  return draw(env, $.ui.resolve(e), segments, { columns: (e.viewport?.columns ?? 100) - 4, background })
}

export const register: Register = on => {
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.surface !== 'terminal') return next(e)
    return (await drawText($, e, e.props.text)) ?? next(e)
  })

  // The person's own prompts, typed in the composer.
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (e.surface !== 'terminal' || e.props.origin.kind !== 'composer') return next(e)
    return (await drawText($, e, e.props.text, true)) ?? next(e)
  })
}
