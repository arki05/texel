import { describe, expect, test } from 'claude-code/testing'

import { cacheDir, showsImages, themeFrom, typstFrom, type Machine } from './host'

const mac: Machine = { home: '/Users/a', os: 'Darwin', env: {} }
const linux: Machine = { home: '/home/a', os: 'Linux', env: {} }

describe('host', () => {
  test('the cache lives where the platform keeps caches', () => {
    expect(cacheDir(mac)).toBe('/Users/a/Library/Caches/texel')
    expect(cacheDir(linux)).toBe('/home/a/.cache/texel')
    expect(cacheDir({ ...linux, env: { XDG_CACHE_HOME: '/tmp/c' } })).toBe('/tmp/c/texel')
  })

  test('images show in kitty and Ghostty, never through tmux', () => {
    expect(showsImages({ ...mac, env: { TERM_PROGRAM: 'ghostty' } })).toBe(true)
    expect(showsImages({ ...linux, env: { TERM: 'xterm-kitty' } })).toBe(true)
    expect(showsImages({ ...mac, env: { TERM_PROGRAM: 'iTerm.app' } })).toBe(false)
    expect(showsImages({ ...mac, env: { TERM_PROGRAM: 'ghostty', TMUX: '/tmp/tmux-1/default' } })).toBe(false)
  })

  test('typst: found and recent, found and old, or missing', () => {
    expect(typstFrom('typst 0.15.1 (unknown commit)')).toEqual({ version: '0.15.1', isSupported: true })
    expect(typstFrom('typst 0.14.2')).toEqual({ version: '0.14.2', isSupported: false })
    expect(typstFrom(undefined)).toEqual({ missing: true })
  })

  test("Claude Code's theme decides; auto follows the system", () => {
    expect(themeFrom('light-daltonized', true)).toBe('light')
    expect(themeFrom('dark-ansi', false)).toBe('dark')
    expect(themeFrom('auto', false)).toBe('light')
    expect(themeFrom(undefined, true)).toBe('dark')
  })
})
