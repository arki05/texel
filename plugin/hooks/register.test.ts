import type { On } from 'claude-code'
import { expect, mock, test, type Engine } from 'claude-code/testing'

// The whole mod against a stubbed host: what it draws, and what it asks typst.

type Ink = { width: number; above: number; below: number }

// A letter's ink: what `typst eval` reports for an inline formula by default.
const LETTER: Ink = { width: 8, above: 7.9, below: 0.2 }
// κ_c(t) = g_c ℓ_c(t): one row holds it at 0.86 of its size.
const SUBSCRIPTS: Ink = { width: 123, above: 14.5, below: 4.9 }

// The first 24 bytes of a PNG: enough for the renderer to read its size.
function fakePng(width: number, height: number) {
  const bytes = new Uint8Array(24)
  const view = new DataView(bytes.buffer)
  view.setUint32(16, width)
  view.setUint32(20, height)
  return btoa(String.fromCharCode(...bytes))
}

/** Answers a command before the stub does, with a result or a refusal. */
type Run = (argv: string[]) => { exitCode: number; stdout: string; stderr: string } | { deny: string } | undefined

type Machine = { terminal?: string; tmux?: string; typst?: string }

// Ghostty on a Mac, typst 0.15: a machine texel draws on.
const GHOSTTY: Machine = { terminal: 'ghostty', typst: 'typst 0.15.1 (test)' }

type World = { macros?: string; ink?: Ink; png?: [number, number]; run?: Run; machine?: Machine }

/**
 * The host beneath the plugin: a machine (by default one texel draws on), an
 * empty cache, a typst that always succeeds (measuring every formula as
 * `ink`, drawing `png`-sized pictures) and an optional macros file. Returns
 * each `typst compile` argv, and `show`, which mounts a message and lets the
 * work it started in the background finish before the test looks.
 */
function world(on: On, { macros, ink = LETTER, png = [47, 51], run, machine = GHOSTTY }: World = {}) {
  const compiles: string[][] = []
  const stdout = (argv: string[]) => {
    if (argv[0] === 'uname') return 'Darwin\n'
    if (argv[0] === 'defaults') return 'Dark'
    if (argv[1] === '--version') return machine.typst ?? ''
    if (argv[1] === 'eval') return JSON.stringify(ink)
    return ''
  }
  const env = { HOME: '/Users/test', TERM: 'xterm-256color', TERM_PROGRAM: machine.terminal, TMUX: machine.tmux }
  mock.env(on, Object.fromEntries(Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined)))
  const clock = mock.clock(on)
  on('ui.render', ($, e) => $.ui.resolve(e).Text({ children: 'engine' }))
  on('config.list', () => ({ value: [{ key: 'theme', value: 'dark' }] }) as never)
  on('process.run', async (_$, e) => {
    const { argv } = e as { argv: string[] }
    const answer = run?.(argv)
    if (answer) return ('deny' in answer ? answer : { value: answer }) as never
    if (argv[0] === 'typst' && argv[1] === 'compile') compiles.push(argv)
    return { value: { exitCode: 0, stdout: stdout(argv), stderr: '' } } as never
  })
  on('fs.exists', () => ({ value: false }) as never)
  on('fs.write', () => ({ value: undefined }) as never)
  on('fs.read', (_$, e) => {
    const { path } = e as { path: string }
    if (path.endsWith('macros.tex')) return (macros === undefined ? { deny: 'no macros file' } : { value: macros }) as never
    if (path.endsWith('texel.typ')) return { value: '// texel' } as never
    return { value: { base64: fakePng(...png) } } as never
  })

  async function show($: Engine, text: string, { prompt = false, columns = 100 } = {}) {
    const drawing = await $.ui.mount({
      plugin: 'texel',
      surface: 'terminal',
      component: prompt ? 'UserMessage' : 'AssistantMessage',
      props: (prompt ? { text, origin: { kind: 'composer' }, isExpanded: false } : { text, isFirstOfReply: true }) as never,
      viewport: { columns, rows: 40 },
    })
    await clock.settle()
    return drawing
  }

  return { compiles, show }
}

const input = (argv: string[] | undefined, name: string) => argv?.find(arg => arg.startsWith(`${name}=`))?.slice(name.length + 1)

// A typst run that is cut short `times` times before it succeeds.
function cutShort(times: number): Run {
  let left = times
  return argv => {
    if (argv[1] !== 'compile' || left === 0) return undefined
    left--
    return { deny: 'interrupted' }
  }
}

test('a reply with display and inline math draws Images', { timeoutMs: 15000 }, async ($, on) => {
  const { compiles, show } = world(on)
  const drawing = await show($, 'So \\(x^2\\) grows:\n\n\\[\\int_0^1 x\\,dx\\]\n\ndone.')
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(2)
  // The LaTeX travels as an input, never spliced into source.
  expect(compiles.map(argv => input(argv, 'tex')).sort()).toEqual(['\\int_0^1 x\\,dx', 'x^2'])
})

test('replies without math are left to the engine', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on)
  const drawing = await show($, 'Nothing to see, costs $5 and $10.')
  expect((await drawing.find({ type: 'Text' }))?.text).toBe('engine')
})

test('your own prompts render too, with your macros', { timeoutMs: 15000 }, async ($, on) => {
  const { compiles, show } = world(on, { macros: '\\newcommand{\\N}{\\mathbb{N}}' })
  const drawing = await show($, 'is \\( n \\in \\N \\) right?', { prompt: true })
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(1)
  expect(input(compiles[0], 'macros')).toBe('\\newcommand{\\N}{\\mathbb{N}}')
})

test('a formula a little too tall keeps its row by default', { timeoutMs: 15000 }, async ($, on) => {
  const { compiles, show } = world(on, { ink: SUBSCRIPTS })
  await show($, 'the ladder \\(\\kappa_c(t)\\) holds')
  expect(input(compiles[0], 'fit-rows')).toBe('1')
})

test('a stricter smallest scale gives it a row instead', { timeoutMs: 15000, options: { inlineMinScale: 0.95 } }, async ($, on) => {
  const { compiles, show } = world(on, { ink: SUBSCRIPTS })
  await show($, 'the ladder \\(\\kappa_c(t)\\) holds')
  expect(input(compiles[0], 'fit-rows')).toBe('2')
})

test('display math wider than the transcript keeps its size and shows its source', { timeoutMs: 15000 }, async ($, on) => {
  // 30 cells wide at 216 ppi; the transcript leaves 16.
  const { compiles, show } = world(on, { png: [Math.round(30 * 7.8 * 3), 51] })
  const drawing = await show($, '\\[ a + b + c + d \\]', { columns: 20 })
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(0)
  expect(await drawing.find({ text: 'wider than the transcript (30 > 16 columns)' })).toBeDefined()
  // Display math never depends on the width, so a resize reuses it.
  expect(input(compiles[0], 'max-columns')).toBe(undefined)
})

test('math takes the math colour, typst blocks the text colour', { timeoutMs: 15000 }, async ($, on) => {
  const { compiles, show } = world(on)
  await show($, 'so \\(x\\)\n\n```typst\nhi\n```')
  const colourOf = (argv: string[] | undefined) => input(argv, 'foreground')
  expect(colourOf(compiles.find(argv => input(argv, 'tex') === 'x'))).toBe('b3bd5a')
  expect(colourOf(compiles.find(argv => input(argv, 'max-columns')))).toBe('e6e6e6')
})

test('an empty math colour follows the text', { timeoutMs: 15000, options: { mathColor: '' } }, async ($, on) => {
  const { compiles, show } = world(on)
  await show($, 'so \\(x\\)')
  expect(input(compiles[0], 'foreground')).toBe('e6e6e6')
})

test('an inline formula typst rejects shows its source and why', { timeoutMs: 15000 }, async ($, on) => {
  const failing: Run = argv => (argv[1] === 'eval' ? { exitCode: 1, stdout: '', stderr: 'error: unknown command: \\foo\n  ┌─ <stdin>' } : undefined)
  const { show } = world(on, { run: failing })
  const drawing = await show($, 'see \\(\\foo{x}\\) here')
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(0)
  expect(await drawing.find({ text: ' (unknown command: \\foo)' })).toBeDefined()
})

test('a run cut short is tried again, and its picture drawn when it succeeds', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on, { run: cutShort(1) })
  const drawing = await show($, 'so \\(x\\) here')
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(1)
})

test('a run cut short again and again stops being tried, and says why', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on, { run: cutShort(Infinity) })
  const drawing = await show($, 'so \\(x\\) here')
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(0)
  expect(await drawing.find({ text: '\\(x\\)' })).toBeDefined()
})

test('in a terminal that cannot show images, the engine draws the row', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on, { machine: { ...GHOSTTY, tmux: '/tmp/tmux-501/default' } })
  const drawing = await show($, 'so \\(x\\) here')
  expect((await drawing.find({ type: 'Text' }))?.text).toBe('engine')
})

test('without typst, the engine draws the row and texel says why, once', { timeoutMs: 15000 }, async ($, on) => {
  const toasts: string[] = []
  const { show } = world(on, { machine: { terminal: 'ghostty' } })
  on('ui.toast', (_$, e) => {
    toasts.push((e as { text: string }).text)
    return { value: undefined } as never
  })
  const first = await show($, 'so \\(x\\) here')
  await show($, 'so \\(x\\) here')
  expect((await first.find({ type: 'Text' }))?.text).toBe('engine')
  expect(toasts).toEqual(['texel: typst not found; install typst 0.15 or newer, then /reload-plugins, to render math'])
})

test('with typstPackages off, a typst block importing a package shows its source', { timeoutMs: 15000, options: { typstPackages: false } }, async ($, on) => {
  const { compiles, show } = world(on)
  const drawing = await show($, '```typst\n#import "@preview/cetz:0.4.2"\nhi\n```')
  expect(await drawing.find({ text: 'not rendered: it imports a package, and typstPackages is off in /config' })).toBeDefined()
  expect(compiles).toHaveLength(0)
})
