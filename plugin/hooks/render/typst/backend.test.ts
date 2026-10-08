import { describe, expect, test } from 'claude-code/testing'

import type { Rendered } from '../result'
import { createTypstBackend, TypstCache, type Io } from './backend'
import type { Compiler } from './compiler'
import type { TypstStyle } from './program'

const style: TypstStyle = { grid: { cellWidth: 7.8, cellHeight: 17, xHeight: 7.15, baseline: 0.773 }, color: 'e6e6e6' }

// A PNG's first 24 bytes, for a picture `columns` x `rows` cells at 216 ppi.
function png(columns: number, rows: number) {
  const bytes = new Uint8Array(24)
  const view = new DataView(bytes.buffer)
  view.setUint32(16, Math.round(columns * 7.8 * 3))
  view.setUint32(20, Math.round(rows * 17 * 3))
  return btoa(String.fromCharCode(...bytes))
}

/** Files in memory, and a compiler that draws every block `size` cells; `failWith` makes runs fail instead. */
function world({ id = 'test', size = [4, 2] as [number, number] } = {}) {
  const disk = new Map<string, string>()
  const calls = { compile: 0, read: 0 }
  const compiledTo: string[] = []
  let fail: (() => Promise<{ error: string }> | undefined) | undefined
  const io: Io = {
    exists: async path => disk.has(path),
    readBase64: async path => (calls.read++, disk.get(path)!),
    rename: async (from, to) => {
      disk.set(to, disk.get(from)!)
      disk.delete(from)
    },
  }
  const compiler: Compiler = {
    id,
    ppi: 216,
    async compile(_, out) {
      calls.compile++
      compiledTo.push(out)
      const failure = fail?.()
      if (failure) return failure
      disk.set(out, png(...size))
      return undefined
    },
  }
  return {
    disk,
    calls,
    compiledTo,
    failWith: (f: typeof fail) => (fail = f),
    backend: (cache = new TypstCache(), c: Compiler = compiler) => createTypstBackend({ io, compiler: c, cache, style, cacheDir: '/cache' }),
    compiler,
  }
}

const block = (maxColumns = 80) => ({ kind: 'typst', typst: 'figure', maxColumns }) as const

describe('typst backend', () => {
  test('known answers nothing before a run, and everything after one', async () => {
    const { backend, calls } = world()
    const b = backend()
    expect(await b.known(block())).toBe(undefined)
    expect(await b.fresh(block())).toMatchObject({ columns: 4, rows: 2 })
    expect(await b.known(block())).toMatchObject({ columns: 4, rows: 2 })
    expect(calls.compile).toBe(1)
  })

  test('a picture already on disk is known without a run, and read once', async () => {
    const { backend, calls } = world()
    await backend().fresh(block())
    const later = backend(new TypstCache())
    expect(await later.known(block())).toMatchObject({ columns: 4 })
    expect(await later.known(block())).toMatchObject({ columns: 4 })
    expect(calls.compile).toBe(1)
    expect(calls.read).toBe(2)
  })

  test("typst's own error is kept: the same source is not run again", async () => {
    const { backend, calls, failWith } = world()
    failWith(() => Promise.resolve({ error: 'error: unclosed delimiter' }))
    const b = backend()
    expect(await b.fresh(block())).toEqual({ error: 'error: unclosed delimiter' })
    expect(await b.known(block())).toEqual({ error: 'error: unclosed delimiter' })
    await b.fresh(block())
    expect(calls.compile).toBe(1)
  })

  test('a run cut short is forgotten and tried again, but not forever', async () => {
    const { backend, calls, failWith } = world()
    failWith(() => Promise.reject(new Error('interrupted')) as never)
    const b = backend()
    expect(await b.fresh(block())).toMatchObject({ transient: true })
    expect(await b.known(block())).toBe(undefined)
    expect(await b.fresh(block())).toMatchObject({ transient: true })
    expect(await b.known(block())).toMatchObject({ transient: true })
    await b.fresh(block())
    expect(calls.compile).toBe(2)
  })

  test('a block drawn at its natural size is reused at any width it fits', async () => {
    const { backend, calls } = world({ size: [10, 3] })
    const b = backend()
    await b.fresh(block(80))
    expect(await b.known(block(40))).toMatchObject({ columns: 10 })
    expect(await b.known(block(8))).toBe(undefined)
    expect(calls.compile).toBe(1)
  })

  test('the compiler is part of every key: another typst never serves its pictures', async () => {
    const { backend, compiler, disk } = world()
    await backend().fresh(block())
    await backend(new TypstCache(), { ...compiler, id: 'other typst' }).fresh(block())
    expect([...disk.keys()].filter(path => path.endsWith('.png'))).toHaveLength(2)
  })

  test('a picture is made under a name of its own and moved into place whole', async () => {
    const { backend, disk, compiledTo } = world()
    const drawn = (await backend().fresh(block())) as Rendered
    expect(compiledTo[0]).toMatch(/\.png\.\w+\.part$/)
    expect('file' in drawn.picture && disk.has(drawn.picture.file)).toBe(true)
    expect([...disk.keys()].some(path => path.endsWith('.part'))).toBe(false)
  })
})
