import { describe, expect, test } from 'claude-code/testing'

import { Limiter } from '../limit'
import { cliCompiler, type Run } from './cli'
import type { Program } from './program'

const block: Program = { source: '#import "/texel.typ": *\n#typst-block[\nhi\n]\n', inputs: { foreground: 'e6e6e6', 'max-columns': '80' } }

function compiler(answer: { exitCode: number; stderr?: string }) {
  const runs: { argv: string[]; stdin: string }[] = []
  const run: Run = async (argv, stdin) => {
    runs.push({ argv, stdin })
    return { stdout: '', stderr: '', ...answer }
  }
  return { typst: cliCompiler({ run, limiter: new Limiter(4), lib: '/lib', version: '0.15.1', library: 'abc' }), runs }
}

describe('cliCompiler', () => {
  test('compile: the source on stdin, the inputs as flags, PNG named whatever the file is called', async () => {
    const { typst, runs } = compiler({ exitCode: 0 })
    expect(await typst.compile(block, '/out.png.x1.part')).toBe(undefined)
    const [{ argv, stdin }] = runs as [{ argv: string[]; stdin: string }]
    expect(stdin).toBe(block.source)
    expect(argv).toEqual([
      'typst', 'compile', '--root', '/lib',
      '--input', 'foreground=e6e6e6', '--input', 'max-columns=80',
      '--format', 'png', '--ppi', '216', '-', '/out.png.x1.part',
    ])
  })

  test("typst's error is its first lines, never transient", async () => {
    const { typst } = compiler({ exitCode: 1, stderr: 'error: unclosed delimiter\n  ┌─ <stdin>:1' })
    expect(await typst.compile(block, '/out.png')).toEqual({ error: 'error: unclosed delimiter\n  ┌─ <stdin>:1' })
  })

  test('its id names everything that changes its output', () => {
    expect(compiler({ exitCode: 0 }).typst.id).toBe('typst-cli 0.15.1 ppi 216 texel.typ abc')
  })
})
