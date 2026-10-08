import { expect, test } from 'claude-code/testing'

import { promptNote } from './prompt'

test('the note always offers LaTeX, and typst blocks only with typst', () => {
  expect(promptNote({ typst: false })).toContain('\\( ... \\)')
  expect(promptNote({ typst: false })).not.toContain('```typst')
  expect(promptNote({ typst: true })).toContain('```typst')
})
