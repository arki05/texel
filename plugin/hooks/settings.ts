// The person's settings: plugin.json's `userConfig`, edited in /config and
// stored under `pluginConfigs.texel.options`. Pure: options in, settings out,
// every value held to a range that cannot break the layout.

import type { PluginOptions } from 'claude-code'

import { DEFAULT_FIT, type FitOptions } from './layout/fit'

export type Settings = {
  /** Ink colours, six hex digits; unset follows the theme's text colour. */
  mathColor?: string
  typstColor?: string
  /** Inline math's size: 1 matches the text's x-height. */
  inlineScale: number
  fit: FitOptions
}

function number(options: PluginOptions, name: string, fallback: number, min: number, max: number) {
  const value = Number(options[name] ?? fallback)
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

// Six hex digits, with or without `#`; anything else counts as unset.
function color(options: PluginOptions, name: string) {
  return /^#?([0-9a-f]{6})$/i.exec(String(options[name] ?? '').trim())?.[1]?.toLowerCase()
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
  }
}
