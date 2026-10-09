import type { On, RenderElement } from 'claude-code'
import { expect, mock, test, type Engine } from 'claude-code/testing'

// The whole mod against a stubbed host: what it draws, what it asks typst,
// what it tells the model. LaTeX goes through the real MathJax; typst is stubbed.

// The first 24 bytes of a PNG: enough for the typst backend to read its size.
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

// Ghostty on a Mac with typst 0.15: a machine texel draws on, typst blocks included.
const GHOSTTY: Machine = { terminal: 'ghostty', typst: 'typst 0.15.1 (test)' }

type World = { macros?: string; png?: [number, number]; run?: Run; machine?: Machine; theme?: { value: string } }

/**
 * The host beneath the plugin: a machine (by default one texel draws on), an
 * empty cache, a typst that always succeeds drawing `png`-sized pictures, and
 * an optional macros file. Returns each `typst compile` argv, and `show`,
 * which mounts a message and lets work started in the background finish
 * before the test looks.
 */
function world(on: On, { macros, png = [47, 51], run, machine = GHOSTTY, theme = { value: 'dark' } }: World = {}) {
  const compiles: string[][] = []
  const stdout = (argv: string[]) => {
    if (argv[0] === 'uname') return 'Darwin\n'
    if (argv[0] === 'defaults') return 'Dark'
    if (argv[1] === '--version') return machine.typst ?? ''
    return ''
  }
  const env = { HOME: '/Users/test', TERM: 'xterm-256color', TERM_PROGRAM: machine.terminal, TMUX: machine.tmux }
  mock.env(on, Object.fromEntries(Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined)))
  const clock = mock.clock(on)
  on('ui.render', ($, e) => $.ui.resolve(e).Text({ children: 'engine' }))
  on('config.list', () => ({ value: [{ key: 'theme', value: theme.value }] }) as never)
  on('process.run', async (_$, e) => {
    const { argv } = e as { argv: string[] }
    const answer = run?.(argv)
    if (answer) return ('deny' in answer ? answer : { value: answer }) as never
    if (argv[0] === 'typst' && argv[1] === 'compile') compiles.push(argv)
    return { value: { exitCode: 0, stdout: stdout(argv), stderr: '' } } as never
  })
  on('fs.exists', () => ({ value: false }) as never)
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

type ImageProps = { source: { rgba?: string; file?: string }; columns: number; rows: number }

// Every Image in a drawn tree, in order.
function images(tree: RenderElement): ImageProps[] {
  const node = tree as unknown as { type?: string; props?: ImageProps; children?: unknown[] }
  const own = node.type === 'Image' && node.props ? [node.props] : []
  return [...own, ...(node.children ?? []).flatMap(child => (child && typeof child === 'object' ? images(child as RenderElement) : []))]
}

// The colour of a MathJax picture's first fully inked pixel, as six hex digits.
function inkColour({ source }: ImageProps) {
  const bytes = Uint8Array.from(atob(source.rgba!), c => c.charCodeAt(0))
  const at = [...Array(bytes.length / 4).keys()].find(i => bytes[i * 4 + 3] === 255)!
  return [...bytes.subarray(at * 4, at * 4 + 3)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// `/texel` typed by the person, with what follows the name.
const texel = ($: Engine, args = '') =>
  $.command.run({ command: 'texel', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } } as never)

// The system prompt as it would be composed for a terminal session.
const composed = ($: Engine) =>
  $.prompt.compose({ model: 'claude', promptModel: 'claude', surfaces: ['terminal'], tools: [], outputStyle: null, traits: [] })

// A typst run that is cut short `times` times before it succeeds.
function cutShort(times: number): Run {
  let left = times
  return argv => {
    if (argv[1] !== 'compile' || left === 0) return undefined
    left--
    return { deny: 'interrupted' }
  }
}

test('a reply with display and inline math draws them as pictures, typst never asked', { timeoutMs: 15000 }, async ($, on) => {
  const { compiles, show } = world(on)
  const drawing = await show($, 'So \\(x^2\\) grows:\n\n\\[\\int_0^1 x\\,dx\\]\n\ndone.')
  const drawn = images(await drawing.drawn())
  expect(drawn).toHaveLength(2)
  expect(drawn.every(image => image.source.rgba)).toBe(true)
  expect(compiles).toHaveLength(0)
})

test('replies without math are left to the engine', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on)
  const drawing = await show($, 'Nothing to see, costs $5 and $10.')
  expect((await drawing.find({ type: 'Text' }))?.text).toBe('engine')
})

test('your own prompts render too, with your macros', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on, { macros: '\\newcommand{\\N}{\\mathbb{N}}' })
  const drawing = await show($, 'is \\( n \\in \\N \\) right?', { prompt: true })
  expect(images(await drawing.drawn())).toHaveLength(1)
})

test('an ordinary formula keeps its row', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on)
  const drawing = await show($, 'the ladder \\(\\kappa_c(t) = g_c \\ell_c(t)\\) holds')
  expect(images(await drawing.drawn())[0]?.rows).toBe(1)
})

test('with a stricter smallest scale, the same formula takes a row', { timeoutMs: 15000, options: { inlineMinScale: 0.95 } }, async ($, on) => {
  const { show } = world(on)
  const drawing = await show($, 'the ladder \\(\\kappa_c(t) = g_c \\ell_c(t)\\) holds')
  expect(images(await drawing.drawn())[0]?.rows).toBe(2)
})

test('display math wider than the transcript keeps its size and shows its source', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on)
  const drawing = await show($, '\\[ a + b + c + d + e + f + g + h + i + j + k + l + m \\]', { columns: 20 })
  expect(images(await drawing.drawn())).toHaveLength(0)
  expect(await drawing.find({ text: 'wider than the transcript' })).toBeDefined()
})

test('math takes the math colour, typst blocks the text colour', { timeoutMs: 15000 }, async ($, on) => {
  const { compiles, show } = world(on)
  const drawing = await show($, 'so \\(x\\)\n\n```typst\nhi\n```')
  expect(inkColour(images(await drawing.drawn())[0]!)).toBe('b3bd5a')
  expect(input(compiles[0], 'foreground')).toBe('e6e6e6')
})

test('an empty math colour follows the text', { timeoutMs: 15000, options: { mathColor: '' } }, async ($, on) => {
  const { show } = world(on)
  const drawing = await show($, 'so \\(x\\)')
  expect(inkColour(images(await drawing.drawn())[0]!)).toBe('e6e6e6')
})

test('an inline formula TeX rejects shows its source and why', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on)
  const drawing = await show($, 'see \\(\\foo{x}\\) here')
  expect(images(await drawing.drawn())).toHaveLength(0)
  expect(await drawing.find({ text: ' (Undefined control sequence \\foo)' })).toBeDefined()
})

test('a typst run cut short is tried again, and its picture drawn when it succeeds', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on, { run: cutShort(1) })
  const drawing = await show($, '```typst\nhi\n```')
  expect(images(await drawing.drawn())).toHaveLength(1)
})

test('a typst run cut short again and again stops being tried, and says why', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on, { run: cutShort(Infinity) })
  const drawing = await show($, '```typst\nhi\n```')
  expect(images(await drawing.drawn())).toHaveLength(0)
  expect(await drawing.find({ text: 'render failed' })).toBeDefined()
})

test('in a terminal that cannot show images, the engine draws the row', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on, { machine: { ...GHOSTTY, tmux: '/tmp/tmux-501/default' } })
  const drawing = await show($, 'so \\(x\\) here')
  expect((await drawing.find({ type: 'Text' }))?.text).toBe('engine')
})

test('without typst, LaTeX still renders and a typst block says what it needs', { timeoutMs: 15000 }, async ($, on) => {
  const { compiles, show } = world(on, { machine: { terminal: 'ghostty' } })
  const drawing = await show($, 'so \\(x\\)\n\n```typst\nhi\n```')
  expect(images(await drawing.drawn())).toHaveLength(1)
  expect(await drawing.find({ text: 'needs typst 0.15 or newer, which is not installed' })).toBeDefined()
  expect(compiles).toHaveLength(0)
})

test('with typstPackages off, a typst block importing a package shows its source', { timeoutMs: 15000, options: { typstPackages: false } }, async ($, on) => {
  const { compiles, show } = world(on)
  const drawing = await show($, '```typst\n#import "@preview/cetz:0.4.2"\nhi\n```')
  expect(await drawing.find({ text: 'not rendered: it imports a package, and typstPackages is off in /config' })).toBeDefined()
  expect(compiles).toHaveLength(0)
})

test('/texel source shows every message as its source, and again renders', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on)
  expect((await texel($, 'source')).text).toContain('showing sources')
  expect((await (await show($, 'so \\(x\\) here')).find({ type: 'Text' }))?.text).toBe('engine')
  await texel($, 'source')
  expect(images(await (await show($, 'so \\(x\\) here')).drawn())).toHaveLength(1)
})

test('/texel says what texel draws with', { timeoutMs: 15000 }, async ($, on) => {
  world(on, { machine: { terminal: 'ghostty' } })
  const { text } = await texel($)
  // Claude Code names the command itself: no `texel:` of our own.
  expect(text).not.toMatch(/^texel:/)
  expect(text).toContain('LaTeX math: MathJax, built in')
  expect(text).toContain('typst blocks: off, needs typst 0.15 or newer')
})

test('the model is told about LaTeX always, and typst blocks only with typst', { timeoutMs: 15000 }, async ($, on) => {
  world(on, { machine: { terminal: 'ghostty' } })
  on('prompt.compose', () => ({ sections: [] }) as never)
  const { sections } = await composed($)
  const note = sections.find(section => section.id === 'texel:math')
  expect(note?.text).toContain('\\( ... \\)')
  expect(note?.text).not.toContain('```typst')
})

test('with the note turned off, the model is told nothing', { timeoutMs: 15000, options: { promptNote: false } }, async ($, on) => {
  world(on)
  on('prompt.compose', () => ({ sections: [] }) as never)
  expect((await composed($)).sections.find(section => section.id === 'texel:math')).toBeUndefined()
})

test('where texel does not draw, the model is told nothing', { timeoutMs: 15000 }, async ($, on) => {
  world(on, { machine: { ...GHOSTTY, tmux: '/tmp/tmux-501/default' } })
  on('prompt.compose', () => ({ sections: [] }) as never)
  expect((await composed($)).sections.find(section => section.id === 'texel:math')).toBeUndefined()
})

test('a new theme is read again, and math following the text takes its colour', { timeoutMs: 15000, options: { mathColor: '' } }, async ($, on) => {
  const theme = { value: 'dark' }
  const { show } = world(on, { theme })
  on('config.set', (_$, e) => ({ value: (e as { value: string }).value }) as never)
  expect(inkColour(images(await (await show($, 'so \\(x\\)')).drawn())[0]!)).toBe('e6e6e6')
  theme.value = 'light'
  await $.config.set({ key: 'theme', value: 'light' } as never)
  expect(inkColour(images(await (await show($, 'so \\(x\\)')).drawn())[0]!)).toBe('1f1f1f')
})

test('with typst, the model is told about typst blocks too', { timeoutMs: 15000 }, async ($, on) => {
  world(on)
  on('prompt.compose', () => ({ sections: [] }) as never)
  const { sections } = await composed($)
  expect(sections.find(section => section.id === 'texel:math')?.text).toContain('```typst')
})
