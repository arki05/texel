// The person's settings: plugin.json's `userConfig`, edited in /config and
// stored under `pluginConfigs.texel.options`. Pure: options in, settings out,
// every value held to a range that cannot break the layout.
//
// Claude Code fills in the manifest's defaults before texel reads them (math
// in #b3bd5a, say); the fallbacks here are for a value the person cleared or
// made invalid, so an empty colour means "the text colour", by design.

import type { PluginOptions } from 'claude-code'

import { DEFAULT_FIT, type FitOptions } from './layout/fit'
import { FONTS, type FontName, type TerminalFont } from './layout/geometry'

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
export const CUSTOM_FONT = 'Custom'

function number(options: PluginOptions, name: string, fallback: number, min: number, max: number) {
  const value = Number(options[name] ?? fallback)
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

// Six hex digits, with or without `#`; anything else counts as unset.
function color(options: PluginOptions, name: string) {
  return /^#?([0-9a-f]{6})$/i.exec(String(options[name] ?? '').trim())?.[1]?.toLowerCase()
}

// One of `choices`, else the first.
function choice<T extends string>(options: PluginOptions, name: string, choices: readonly T[]): T {
  const value = options[name]
  return choices.includes(value as T) ? (value as T) : choices[0]!
}

function font(options: PluginOptions): TerminalFont {
  const name = String(options.terminalFont ?? '')
  if (Object.hasOwn(FONTS, name)) return FONTS[name as FontName]
  if (name !== CUSTOM_FONT) return FONTS['JetBrains Mono']
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
    typstPackages: options.typstPackages !== false,
    promptNote: options.promptNote !== false,
  }
}
