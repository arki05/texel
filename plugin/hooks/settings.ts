// The person's settings: plugin.json's `userConfig`, edited in /config and
// stored under `pluginConfigs.texel.options`. Pure: options in, settings out,
// every value held to a range that cannot break the layout.
//
// Claude Code fills in the manifest's defaults before texel reads them (math
// in #b3bd5a, say); the fallbacks here are for a value the person cleared or
// made invalid, so an empty colour means "the text colour", by design.

import type { PluginOptions } from 'claude-code'

import { DEFAULT_FIT, type FitOptions } from './layout/fit'
import { FONTS, type FontName, type TerminalFont } from './geometry'

export type Settings = {
  /** Ink colours, six hex digits; unset follows the theme's text colour. */
  mathColor?: string
  typstColor?: string
  /** Inline math's size: 1 matches the text's x-height. */
  inlineScale: number
  fit: FitOptions
  /** The terminal font's proportions: a preset's, or the person's own. */
  font: TerminalFont
  /** Whether to draw pictures: `auto` asks the terminal's environment. */
  images: 'auto' | 'always' | 'never'
  /** Whether a typst block may import packages, which typst downloads. */
  typstPackages: boolean
  /** Whether the system prompt tells Claude this terminal typesets math. */
  promptNote: boolean
}

/** What `terminalFont` names when the person gives the proportions themselves. */
const CUSTOM_FONT = 'Custom'

// A setting as text, trimmed; empty or absent is unset.
function text(options: PluginOptions, name: string): string | undefined {
  const value = String(options[name] ?? '').trim()
  return value === '' ? undefined : value
}

function number(options: PluginOptions, name: string, fallback: number, min: number, max: number) {
  const value = Number(text(options, name) ?? fallback)
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

// On unless turned off: false, or a word for it however it is written.
function flag(options: PluginOptions, name: string) {
  return !/^(?:false|off|no|0)$/i.test(text(options, name) ?? '')
}

// Six hex digits, with or without `#`; anything else counts as unset.
function color(options: PluginOptions, name: string) {
  return /^#?([0-9a-f]{6})$/i.exec(String(options[name] ?? '').trim())?.[1]?.toLowerCase()
}

// One of `choices`, in any case, else the first.
function choice<T extends string>(options: PluginOptions, name: string, choices: readonly T[]): T {
  const value = text(options, name)?.toLowerCase()
  return choices.find(c => c.toLowerCase() === value) ?? choices[0]!
}

function font(options: PluginOptions): TerminalFont {
  // The first preset, JetBrains Mono, unless another is named.
  const name = choice(options, 'terminalFont', [...(Object.keys(FONTS) as FontName[]), CUSTOM_FONT])
  if (name !== CUSTOM_FONT) return FONTS[name]
  const preset = FONTS['JetBrains Mono']
  return {
    aspect: number(options, 'fontAspect', preset.aspect, 1, 4),
    xHeight: number(options, 'fontXHeight', preset.xHeight, 0.2, 0.7),
    baseline: number(options, 'fontBaseline', preset.baseline, 0.5, 0.95),
  }
}

export function readSettings(options: PluginOptions): Settings {
  return {
    mathColor: color(options, 'mathColor'),
    typstColor: color(options, 'typstColor'),
    inlineScale: number(options, 'inlineSize', 1.2, 0.5, 3),
    fit: {
      maxScale: number(options, 'inlineMaxScale', DEFAULT_FIT.maxScale, 1, 3),
      minScale: number(options, 'inlineMinScale', DEFAULT_FIT.minScale, 0.1, 1),
      shiftUp: number(options, 'inlineShiftUp', DEFAULT_FIT.shiftUp, 0, 1),
      shiftDown: number(options, 'inlineShiftDown', DEFAULT_FIT.shiftDown, 0, 1),
    },
    font: font(options),
    images: choice(options, 'images', ['auto', 'always', 'never']),
    typstPackages: flag(options, 'typstPackages'),
    promptNote: flag(options, 'promptNote'),
  }
}
