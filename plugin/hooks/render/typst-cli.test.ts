import { describe, expect, test } from 'claude-code/testing'

import { Limiter } from './limit'
import { cliCompiler, type Run } from './typst-cli'
import type { Program } from './typst'

const ink: Program = { source: '#import "/texel.typ": *\n#inline-ink()\n', inputs: { tex: 'x', macros: '' } }

function compiler(answer: { exitCode: number; stdout?: string; stderr?: string }) {
  const runs: { argv: string[]; stdin: string }[] = []
  const run: Run = async (argv, stdin) => {
    runs.push({ argv, stdin })
    return { stdout: '', stderr: '', ...answer }
  }
  const typst = cliCompiler({ run, limiter: new Limiter(4), lib: '/lib', version: '0.15.1', library: 'abc' })
  return { typst, runs }
}

describe('cliCompiler', () => {
  test('compile: the source on stdin, the inputs as flags, the bundled packages first', async () => {
    const { typst, runs } = compiler({ exitCode: 0 })
    expect(await typst.compile(ink, '/out.png')).toBe(undefined)
    const [{ argv, stdin }] = runs as [{ argv: string[]; stdin: string }]
    expect(stdin).toBe(ink.source)
    expect(argv.slice(0, 6)).toEqual(['typst', 'compile', '--root', '/lib', '--package-path', '/lib/packages'])
    expect(argv).toEqual(expect.arrayContaining(['--input', 'tex=x', '--input', 'macros=']))
    expect(argv.slice(-2)).toEqual(['-', '/out.png'])
  })

  test('measure reads the ink back from its label', async () => {
    const { typst, runs } = compiler({ exitCode: 0, stdout: '{"width":8,"above":7.9,"below":0.2}' })
    expect(await typst.measure(ink)).toEqual({ width: 8, above: 7.9, below: 0.2 })
    expect(runs[0]?.argv.slice(-3)).toEqual(['--in', '-', 'query(<ink>).first().value'])
  })

  test("typst's error is its first lines, never transient", async () => {
    const { typst } = compiler({ exitCode: 1, stderr: 'error: unknown command: \\foo\n  ┌─ <stdin>:1' })
    expect(await typst.compile(ink, '/out.png')).toEqual({ error: 'error: unknown command: \\foo\n  ┌─ <stdin>:1' })
  })

  test('its id names everything that changes its output', () => {
    expect(compiler({ exitCode: 0 }).typst.id).toBe('typst-cli 0.15.1 ppi 216 texel.typ abc')
  })
})
