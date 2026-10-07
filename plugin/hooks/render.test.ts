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

/**
 * Stands in for the host beneath the plugin: an empty cache, a typst that
 * always succeeds, and an optional macros file. Returns each typst argv.
 */
function host(on: On, { macros }: { macros?: string } = {}) {
  const compiles: string[][] = []
  on('ui.render', ($, e) => $.ui.resolve(e).Text({ children: 'engine' }))
  on('process.run', async (_$, e) => {
    const { argv } = e as { argv: string[] }
    if (argv[0] === 'typst') compiles.push(argv)
    return { value: { exitCode: 0, stdout: argv[0] === 'defaults' ? 'Dark' : '/Users/test', stderr: '' } } as never
  })
  on('fs.exists', () => ({ value: false }) as never)
  on('fs.read', (_$, e) => {
    const { path } = e as { path: string }
    if (path.endsWith('macros.tex')) return (macros === undefined ? { deny: 'no macros file' } : { value: macros }) as never
    if (path.endsWith('texel.typ')) return { value: '// texel' } as never
    return { value: { base64: fakePng(47, 51) } } as never
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
