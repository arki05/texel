import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

// The first 24 bytes of a PNG: enough for the pipeline to read its size.
function fakePng(width: number, height: number) {
  const bytes = new Uint8Array(24)
  const view = new DataView(bytes.buffer)
  view.setUint32(16, width)
  view.setUint32(20, height)
  return btoa(String.fromCharCode(...bytes))
}

type Ink = { width: number; above: number; below: number }

// A letter's ink: what `typst eval` reports for an inline formula by default.
const LETTER: Ink = { width: 8, above: 7.9, below: 0.2 }

/**
 * Stands in for the host beneath the plugin: an empty cache, a typst that
 * always succeeds (measuring every formula as `ink`), and an optional macros
 * file. `run` may answer a command first, as a result or a refusal. Returns
 * each `typst compile` argv.
 */
type Run = (argv: string[]) => { exitCode: number; stdout: string; stderr: string } | { deny: string } | undefined

function host(
  on: On,
  { macros, ink = LETTER, png = [47, 51], run }: { macros?: string; ink?: Ink; png?: [number, number]; run?: Run } = {},
) {
  const compiles: string[][] = []
  const stdout = (argv: string[]) =>
    argv[0] === 'defaults' ? 'Dark' : argv[1] === 'eval' ? JSON.stringify(ink) : '/Users/test'
  on('ui.render', ($, e) => $.ui.resolve(e).Text({ children: 'engine' }))
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
  return compiles
}

const input = (argv: string[], name: string) => argv.find(arg => arg.startsWith(`${name}=`))?.slice(name.length + 1)

test('a reply with display and inline math draws Images', { timeoutMs: 15000 }, async ($, on) => {
  const compiles = host(on)
  const drawing = await $.ui.mount({
    plugin: 'texel',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: { text: 'So \\(x^2\\) grows:\n\n\\[\\int_0^1 x\\,dx\\]\n\ndone.', isFirstOfReply: true },
    viewport: { columns: 100, rows: 40 },
  })
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(2)
  // The LaTeX travels as an input, never spliced into source.
  expect(compiles.map(argv => input(argv, 'tex')).sort()).toEqual(['\\int_0^1 x\\,dx', 'x^2'])
})

test('replies without math are left to the engine', async ($, on) => {
  host(on)
  const drawing = await $.ui.mount({
    plugin: 'texel',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: { text: 'Nothing to see, costs $5 and $10.', isFirstOfReply: true },
  })
  expect((await drawing.find({ type: 'Text' }))?.text).toBe('engine')
})

test('your own prompts render too, with your macros', { timeoutMs: 15000 }, async ($, on) => {
  const compiles = host(on, { macros: '\\newcommand{\\N}{\\mathbb{N}}' })
  const drawing = await $.ui.mount({
    plugin: 'texel',
    surface: 'terminal',
    component: 'UserMessage',
    props: { text: 'is \\( n \\in \\N \\) right?', origin: { kind: 'composer' }, isExpanded: false } as never,
  })
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(1)
  expect(input(compiles[0] ?? [], 'macros')).toBe('\\newcommand{\\N}{\\mathbb{N}}')
})

// κ_c(t) = g_c ℓ_c(t): one row holds it at 0.86 of its size.
const SUBSCRIPTS: Ink = { width: 123, above: 14.5, below: 4.9 }

test('a formula a little too tall keeps its row by default', { timeoutMs: 15000 }, async ($, on) => {
  const compiles = host(on, { ink: SUBSCRIPTS })
  await $.ui.mount({
    plugin: 'texel',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: { text: 'the ladder \\(\\kappa_c(t)\\) holds', isFirstOfReply: true },
  })
  expect(input(compiles[0] ?? [], 'fit-rows')).toBe('1')
})

test('a stricter smallest scale gives it a row instead', { timeoutMs: 15000, options: { inlineMinScale: 0.95 } }, async ($, on) => {
  const compiles = host(on, { ink: SUBSCRIPTS })
  await $.ui.mount({
    plugin: 'texel',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: { text: 'the ladder \\(\\kappa_c(t)\\) holds', isFirstOfReply: true },
  })
  expect(input(compiles[0] ?? [], 'fit-rows')).toBe('2')
})

test('display math wider than the transcript keeps its size and shows its source', { timeoutMs: 15000 }, async ($, on) => {
  // 30 cells wide at 216 ppi; the transcript leaves 16.
  const compiles = host(on, { png: [Math.round(30 * 7.8 * 3), 51] })
  const drawing = await $.ui.mount({
    plugin: 'texel',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: { text: '\\[ a + b + c + d \\]', isFirstOfReply: true },
    viewport: { columns: 20, rows: 40 },
  })
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(0)
  expect(await drawing.find({ text: 'wider than the transcript (30 > 16 columns)' })).toBeDefined()
  // Display math never depends on the width, so a resize reuses it.
  expect(input(compiles[0] ?? [], 'max-columns')).toBe(undefined)
})

test('math takes the math colour, typst blocks the text colour', { timeoutMs: 15000 }, async ($, on) => {
  const compiles = host(on)
  await $.ui.mount({
    plugin: 'texel',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: { text: 'so \\(x\\)\n\n```typst\nhi\n```', isFirstOfReply: true },
  })
  const colour = (main: string) => input(compiles.find(argv => argv.some(arg => arg.includes(main))) ?? [], 'foreground')
  expect(colour('tex=x')).toBe('b3bd5a')
  expect(compiles.map(argv => input(argv, 'foreground'))).toContain('e6e6e6')
})

test('an empty math colour follows the text', { timeoutMs: 15000, options: { mathColor: '' } }, async ($, on) => {
  const compiles = host(on)
  await $.ui.mount({
    plugin: 'texel',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: { text: 'so \\(x\\)', isFirstOfReply: true },
  })
  expect(input(compiles[0] ?? [], 'foreground')).toBe('e6e6e6')
})

test('an inline formula typst rejects shows its source and why', { timeoutMs: 15000 }, async ($, on) => {
  host(on, {
    run: argv => (argv[1] === 'eval' ? { exitCode: 1, stdout: '', stderr: 'error: unknown command: \\foo\n  ┌─ <stdin>' } : undefined),
  })
  const drawing = await $.ui.mount({
    plugin: 'texel',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: { text: 'see \\(\\foo{x}\\) here', isFirstOfReply: true },
  })
  expect(await drawing.findAll({ type: 'Image' })).toHaveLength(0)
  expect(await drawing.find({ text: ' (unknown command: \\foo)' })).toBeDefined()
})

test('a run cut short is tried again on the next draw', { timeoutMs: 15000 }, async ($, on) => {
  let cutShort = true
  host(on, {
    run: argv => {
      if (argv[1] !== 'compile' || !cutShort) return undefined
      cutShort = false
      return { deny: 'interrupted' }
    },
  })
  const props = { text: 'so \\(x\\) here', isFirstOfReply: true }
  const first = await $.ui.mount({ plugin: 'texel', surface: 'terminal', component: 'AssistantMessage', props })
  expect(await first.findAll({ type: 'Image' })).toHaveLength(0)
  const second = await $.ui.mount({ plugin: 'texel', surface: 'terminal', component: 'AssistantMessage', props })
  expect(await second.findAll({ type: 'Image' })).toHaveLength(1)
})
