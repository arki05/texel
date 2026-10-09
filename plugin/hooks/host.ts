// What texel infers about the machine it runs on, from facts the hooks module
// gathers: where the cache lives, whether the terminal shows images, which
// typst is installed, which theme applies. Pure: facts in, decisions out.

import type { Theme } from './look'
import type { Settings } from './settings'

/** The facts the hooks module reads once per load. */
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

/** How many files the cache keeps; past it, the oldest go, to be drawn again when needed. */
const CACHE_FILES = 4000

/** The command that removes all but the newest `keep` files of the cache folder. */
export function pruneCommand(cacheDir: string, keep = CACHE_FILES) {
  const script = 'cd "$1" 2>/dev/null || exit 0; ls -t | tail -n +"$2" | while IFS= read -r f; do rm -f -- "$f"; done'
  return ['/bin/sh', '-c', script, 'prune', cacheDir, String(keep + 1)]
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

/**
 * Why texel draws no pictures here, if it does not: the `images` setting
 * says never, or, on `auto`, the terminal shows none.
 */
export function whyNoPictures(images: Settings['images'], machine: Machine): string | undefined {
  if (images === 'never') return 'images is set to never in /config'
  if (images === 'always' || showsImages(machine)) return undefined
  return machine.env.TMUX ? 'pictures do not pass through tmux' : 'this terminal shows no pictures (texel needs kitty or Ghostty)'
}

/** The oldest typst texel works with: texel.typ and the command line it runs are checked against 0.15. */
const MIN_TYPST = [0, 15] as const

/** Whether typst blocks can be drawn here: with which typst, or why not, in words. */
export type TypstStatus = { version: string } | { unavailable: string }

/** From what `typst --version` printed (`typst 0.15.1 (...)`), or undefined when it would not run. */
export function typstFrom(stdout: string | undefined): TypstStatus {
  const needed = `typst ${MIN_TYPST.join('.')} or newer`
  const match = stdout && /typst (\d+)\.(\d+)\.(\d+)/.exec(stdout)
  if (!match) return { unavailable: `needs ${needed}, which is not installed` }
  const [major, minor] = [Number(match[1]), Number(match[2])]
  const version = `${match[1]}.${match[2]}.${match[3]}`
  if (major < MIN_TYPST[0] || (major === MIN_TYPST[0] && minor < MIN_TYPST[1])) return { unavailable: `needs ${needed}; this is typst ${version}` }
  return { version }
}

/** Claude Code's `theme` setting (`dark`, `light-ansi`, `auto`, ...); `auto` follows the system. */
export function themeFrom(setting: unknown, systemIsDark: boolean): Theme {
  const value = String(setting ?? '')
  if (value.startsWith('light')) return 'light'
  if (value.startsWith('dark')) return 'dark'
  return systemIsDark ? 'dark' : 'light'
}
