// What texel infers about the terminal and the machine it runs on, from facts
// the hooks module gathers: the font's proportions, where the cache lives,
// whether the terminal shows images, which typst is installed, which theme
// applies. Pure: facts in, decisions out.

import type { Grid } from './render/typst'

/**
 * A terminal font's proportions, which are all the layout needs: pictures
 * are stretched to fill their cells, so only ratios matter. `aspect` is the
 * cell's height over its width; x-height and baseline are fractions of the
 * cell's height, the baseline measured from its top.
 */
export type TerminalFont = { aspect: number; xHeight: number; baseline: number }

/** The fonts terminals that show images default to, from their hhea and OS/2 tables. */
export const FONTS = {
  /** Ghostty's default. */
  'JetBrains Mono': { aspect: 2.2, xHeight: 0.4167, baseline: 0.7727 },
  /** kitty's default on macOS (Menlo) and Linux (DejaVu Sans Mono): one design. */
  'Menlo / DejaVu Sans Mono': { aspect: 1.9335, xHeight: 0.4698, baseline: 0.7974 },
  'SF Mono': { aspect: 1.9052, xHeight: 0.4465, baseline: 0.8209 },
  Monaco: { aspect: 2.1989, xHeight: 0.409, baseline: 0.7499 },
} satisfies Record<string, TerminalFont>

export type FontName = keyof typeof FONTS

// A nominal cell height, in points: it sets the pictures' resolution, not
// their size, which the terminal decides.
const CELL_HEIGHT = 17

export function gridFor({ aspect, xHeight, baseline }: TerminalFont): Grid {
  return { cellWidth: CELL_HEIGHT / aspect, cellHeight: CELL_HEIGHT, xHeight: xHeight * CELL_HEIGHT, baseline }
}

/** The environment the hooks module reads once per load. */
export type Machine = {
  home: string
  /** `uname -s`: `Darwin`, `Linux`, ... */
  os: string
  env: { XDG_CACHE_HOME?: string; TERM?: string; TERM_PROGRAM?: string; KITTY_WINDOW_ID?: string; TMUX?: string }
}

/** Where rendered pictures and measurements are kept: the platform's cache folder. */
export function cacheDir({ home, os, env }: Machine) {
  if (os === 'Darwin') return `${home}/Library/Caches/texel`
  return `${env.XDG_CACHE_HOME || `${home}/.cache`}/texel`
}

/**
 * Whether the terminal draws Claude Code's images: the kitty graphics protocol
 * with Unicode placeholders, which kitty and Ghostty (cmux included) have, and
 * which tmux does not pass through.
 */
export function showsImages({ env }: Machine) {
  if (env.TMUX) return false
  return env.TERM === 'xterm-kitty' || Boolean(env.KITTY_WINDOW_ID) || env.TERM_PROGRAM === 'ghostty'
}

/** The oldest typst the bundled mitex works with; texel is tested on 0.15. */
export const MIN_TYPST = [0, 12] as const

export type Typst = { version: string; isSupported: boolean } | { missing: true }

/** What `typst --version` printed (`typst 0.15.1 (...)`), or undefined when it would not run. */
export function typstFrom(stdout: string | undefined): Typst {
  const match = stdout && /typst (\d+)\.(\d+)\.(\d+)/.exec(stdout)
  if (!match) return { missing: true }
  const [major, minor] = [Number(match[1]), Number(match[2])]
  const isSupported = major > MIN_TYPST[0] || (major === MIN_TYPST[0] && minor >= MIN_TYPST[1])
  return { version: `${match[1]}.${match[2]}.${match[3]}`, isSupported }
}

/** Claude Code's `theme` setting (`dark`, `light-ansi`, `auto`, ...); `auto` follows the system. */
export function themeFrom(setting: unknown, systemIsDark: boolean): 'dark' | 'light' {
  const value = String(setting ?? '')
  if (value.startsWith('light')) return 'light'
  if (value.startsWith('dark')) return 'dark'
  return systemIsDark ? 'dark' : 'light'
}
