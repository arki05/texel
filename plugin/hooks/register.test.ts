import type { On, RenderElement } from 'claude-code'
import { expect, mock, test, type Engine } from 'claude-code/testing'

import { decodePng } from './render/png'

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

type ImageProps = { source: { png?: string; file?: string }; columns: number; rows: number }

// Every Image in a drawn tree, in order.
function images(tree: RenderElement): ImageProps[] {
  const node = tree as unknown as { type?: string; props?: ImageProps; children?: unknown[] }
  const own = node.type === 'Image' && node.props ? [node.props] : []
  return [...own, ...(node.children ?? []).flatMap(child => (child && typeof child === 'object' ? images(child as RenderElement) : []))]
}

type Node = { type?: string; props?: Record<string, unknown>; children?: unknown[]; text?: string }

// The nearest Box above the first node `match` finds, as the drawn tree nests them.
function boxAround(tree: RenderElement, match: (node: Node) => boolean): Record<string, unknown> | undefined {
  const walk = (node: Node, box: Record<string, unknown> | undefined): Record<string, unknown> | undefined => {
    if (match(node)) return box
    const own = node.type === 'Box' ? node.props : box
    for (const child of node.children ?? []) {
      const found = child && typeof child === 'object' ? walk(child as Node, own) : undefined
      if (found) return found
    }
    return undefined
  }
  return walk(tree as unknown as Node, undefined)
}
const textOf = (node: Node) => (node.children ?? []).filter(child => typeof child === 'string').join('')

// The colour of a MathJax picture's first fully inked pixel, as six hex digits.
function inkColour({ source }: ImageProps) {
  const bytes = decodePng(Uint8Array.from(atob(source.png!), c => c.charCodeAt(0))).rgba
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
  expect(drawn.every(image => image.source.png)).toBe(true)
  expect(compiles).toHaveLength(0)
})

test('a reply full of display math is drawn whole: its pictures fit in one message', { timeoutMs: 30000 }, async ($, on) => {
  const { show } = world(on)
  const formulas = [
    'I^2 = \\int_0^{2\\pi}\\!\\int_0^\\infty e^{-r^2}\\, r \\,dr\\,d\\theta = \\pi \\quad\\Longrightarrow\\quad \\boxed{\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}}',
    'R(\\theta) = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}',
    '|x| = \\begin{cases} x & x \\geq 0 \\\\ -x & \\text{otherwise} \\end{cases}',
  ]
  const reply = Array.from({ length: 4 }, () => formulas.map(f => `\\[${f}\\]`).join('\n\n')).join('\n\n')
  const drawn = images(await (await show($, reply)).drawn())
  expect(drawn).toHaveLength(12)
  // Claude Code takes at most 2 MiB of Image source in one message's drawing.
  expect(drawn.reduce((sum, image) => sum + image.source.png!.length, 0)).toBeLessThan(2 * 1024 * 1024)
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

test('text sits on a tall formula\'s text row: the rows it grows above come first', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on)
  const tree = await (await show($, 'see \\(\\begin{pmatrix} a \\\\ b \\\\ c \\end{pmatrix}\\) here')).drawn()
  const [matrix] = images(tree)
  const text = boxAround(tree, node => node.type === 'Text' && textOf(node) === 'see ')
  const picture = boxAround(tree, node => node.type === 'Box' && node.props?.flexShrink === 0)
  expect(matrix!.rows).toBeGreaterThan(1)
  // The picture starts at the line's top; the text, the rows above it down.
  expect(picture?.marginTop).toBe(0)
  expect(text?.marginTop).toBeGreaterThanOrEqual(1)
  expect(text?.marginTop).toBeLessThan(matrix!.rows)
})

test('a list item\'s later rows hang under its text, not its marker', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on)
  const tree = await (await show($, '- a list item with \\(x\\) and words enough to wrap onto a second row here', { columns: 34 })).drawn()
  const rows = (function collect(node: Node): Record<string, unknown>[] {
    const own = node.type === 'Box' && node.props?.flexDirection === 'row' ? [node.props] : []
    return [...own, ...(node.children ?? []).flatMap(child => (child && typeof child === 'object' ? collect(child as Node) : []))]
  })(tree as unknown as Node)
  // The marker `• ` is two columns: every row after the first starts under the text.
  expect(rows.length).toBeGreaterThan(1)
  expect(rows.map(row => row.paddingLeft)).toEqual([0, ...rows.slice(1).map(() => 2)])
})

test('with a stricter smallest scale, the same formula takes a row', { timeoutMs: 15000, options: { inlineMinScale: 0.95 } }, async ($, on) => {
  const { show } = world(on)
  const drawing = await show($, 'the ladder \\(\\kappa_c(t) = g_c \\ell_c(t)\\) holds')
  expect(images(await drawing.drawn())[0]?.rows).toBe(2)
})

test('display math wider than the transcript shrinks to fit it, and below half its size shows its source', { timeoutMs: 15000 }, async ($, on) => {
  const { show } = world(on)
  const formula = '\\[ a + b + c + d + e + f + g + h + i + j + k + l + m \\]'
  const [fitted] = images(await (await show($, formula, { columns: 34 })).drawn())
  expect(fitted!.columns).toBeLessThanOrEqual(30)
  const narrow = await show($, formula, { columns: 16 })
  expect(images(await narrow.drawn())).toHaveLength(0)
  expect(await narrow.find({ text: 'render failed: too wide to fit at a readable size' })).toBeDefined()
})

test('a typst block is laid out at the transcript\'s width, up to typstMaxWidth', { timeoutMs: 15000, options: { typstMaxWidth: 60 } }, async ($, on) => {
  const { compiles, show } = world(on)
  await show($, '```typst\nhi\n```', { columns: 200 })
  await show($, '```typst\nho\n```', { columns: 40 })
  expect(compiles.map(argv => input(argv, 'max-columns'))).toEqual(['60', '36'])
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

test('/texel source where texel does not draw says why, and switches nothing', { timeoutMs: 15000 }, async ($, on) => {
  world(on, { machine: { ...GHOSTTY, tmux: '/tmp/tmux-501/default' } })
  expect((await texel($, 'source')).text).toContain('nothing to switch: texel is not drawing here (pictures do not pass through tmux)')
  expect((await texel($)).text).toContain('not drawing here: pictures do not pass through tmux')
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
