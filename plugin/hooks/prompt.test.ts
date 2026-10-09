import { expect, test } from 'claude-code/testing'

import { promptNote } from './prompt'

test('the note always offers LaTeX, and typst blocks only with typst', () => {
  expect(promptNote({ typst: false, packages: true })).toContain('\\( ... \\)')
  expect(promptNote({ typst: false, packages: true })).not.toContain('```typst')
  expect(promptNote({ typst: true, packages: true })).toContain('```typst')
})

test('diagrams from packages are offered only where packages may be imported', () => {
  expect(promptNote({ typst: true, packages: true })).toContain('cetz')
  expect(promptNote({ typst: true, packages: false })).not.toContain('cetz')
  expect(promptNote({ typst: true, packages: false })).toContain('cannot import packages')
})
