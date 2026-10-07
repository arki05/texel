import { describe, expect, test } from 'claude-code/testing'

import type { Ink } from '../layout/geometry'
import type { Compiler } from './compiler'
import { createRenderer, RenderCache, type Io } from './renderer'
import type { Style } from './typst'

const style: Style = {
  grid: { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 },
  mathColor: 'b3bd5a',
  typstColor: 'e6e6e6',
  inlineScale: 1.2,
  macros: '',
}

// A PNG's first 24 bytes, for a picture `columns` x `rows` cells at 216 ppi.
function png(columns: number, rows: number) {
  const bytes = new Uint8Array(24)
  const view = new DataView(bytes.buffer)
  view.setUint32(16, Math.round(columns * 7.8 * 3))
  view.setUint32(20, Math.round(rows * 17 * 3))
  return btoa(String.fromCharCode(...bytes))
}

/**
 * Files in memory, and a compiler that draws every picture `size` cells and
 * measures every formula as a letter; `fail` makes a run fail instead.
 */
function world({ id = 'test', size = [4, 2] as [number, number] } = {}) {
  const disk = new Map<string, string>()
  const calls = { compile: 0, measure: 0, read: 0 }
  let fail: ((kind: 'compile' | 'measure') => Promise<{ error: string }> | undefined) | undefined
  const io: Io = {
    exists: async path => disk.has(path),
    readText: async path => disk.get(path)!,
    writeText: async (path, text) => void disk.set(path, text),
    readBase64: async path => (calls.read++, disk.get(path)!),
  }
  const compiler: Compiler = {
    id,
    ppi: 216,
    async compile(_, out) {
      calls.compile++
      const failure = fail?.('compile')
      if (failure) return failure
      disk.set(out, png(...size))
      return undefined
    },
    async measure() {
      calls.measure++
      const failure = fail?.('measure')
      if (failure) return failure
      return { width: 8, above: 7.9, below: 0.2 } satisfies Ink
    },
  }
  return {
    disk,
    calls,
    failWith: (f: typeof fail) => (fail = f),
    renderer: (cache = new RenderCache(), c: Compiler = compiler) => createRenderer({ io, compiler: c, cache, style, cacheDir: '/cache' }),
    compiler,
  }
}

const display = { kind: 'display', tex: 'x' } as const

describe('renderer', () => {
  test('known answers nothing before a run, and everything after one', async () => {
    const { renderer, calls } = world()
    const r = renderer()
    expect(await r.known.picture(display)).toBe(undefined)
    expect(await r.fresh.picture(display)).toMatchObject({ columns: 4, rows: 2 })
    expect(await r.known.picture(display)).toMatchObject({ columns: 4, rows: 2 })
    expect(calls.compile).toBe(1)
  })

  test('a picture already on disk is known without a run, and read once', async () => {
    const { renderer, calls } = world()
    await renderer().fresh.picture(display)
    const later = renderer(new RenderCache())
    expect(await later.known.picture(display)).toMatchObject({ columns: 4 })
    expect(await later.known.picture(display)).toMatchObject({ columns: 4 })
    expect(calls.compile).toBe(1)
    expect(calls.read).toBe(2)
  })

  test("typst's own error is kept: the same source is not run again", async () => {
    const { renderer, calls, failWith } = world()
    failWith(() => Promise.resolve({ error: 'error: unknown command' }))
    const r = renderer()
    expect(await r.fresh.picture(display)).toEqual({ error: 'error: unknown command' })
    expect(await r.known.picture(display)).toEqual({ error: 'error: unknown command' })
    await r.fresh.picture(display)
    expect(calls.compile).toBe(1)
  })

  test('a run cut short is forgotten and tried again, but not forever', async () => {
    const { renderer, calls, failWith } = world()
    failWith(() => Promise.reject(new Error('interrupted')) as never)
    const r = renderer()
    expect(await r.fresh.picture(display)).toMatchObject({ transient: true })
    expect(await r.known.picture(display)).toBe(undefined)
    expect(await r.fresh.picture(display)).toMatchObject({ transient: true })
    expect(await r.known.picture(display)).toMatchObject({ transient: true })
    await r.fresh.picture(display)
    expect(calls.compile).toBe(2)
  })

  test('a typst block drawn at its natural size is reused at any width it fits', async () => {
    const { renderer, calls } = world({ size: [10, 3] })
    const r = renderer()
    await r.fresh.picture({ kind: 'typst', typst: 'figure', maxColumns: 80 })
    expect(await r.known.picture({ kind: 'typst', typst: 'figure', maxColumns: 40 })).toMatchObject({ columns: 10 })
    expect(await r.known.picture({ kind: 'typst', typst: 'figure', maxColumns: 8 })).toBe(undefined)
    expect(calls.compile).toBe(1)
  })

  test('the compiler is part of every key: another typst never serves its pictures', async () => {
    const { renderer, compiler, disk } = world()
    await renderer().fresh.picture(display)
    await renderer(new RenderCache(), { ...compiler, id: 'other typst' }).fresh.picture(display)
    expect([...disk.keys()].filter(path => path.endsWith('.png'))).toHaveLength(2)
  })

  test('ink is measured once, kept on disk, and known from there', async () => {
    const { renderer, calls } = world()
    expect(await renderer().fresh.ink('x')).toEqual({ width: 8, above: 7.9, below: 0.2 })
    expect(await renderer(new RenderCache()).known.ink('x')).toEqual({ width: 8, above: 7.9, below: 0.2 })
    expect(calls.measure).toBe(1)
  })
})
