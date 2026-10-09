import { expect, test } from 'claude-code/testing'

import { promptNote } from './prompt'

test('the note always offers LaTeX, and typst blocks only with typst', () => {
  expect(promptNote({ typst: false, packages: true, theme: 'dark' })).toContain('\\( ... \\)')
  expect(promptNote({ typst: false, packages: true, theme: 'dark' })).not.toContain('```typst')
  expect(promptNote({ typst: true, packages: true, theme: 'dark' })).toContain('```typst')
})

test('diagrams from packages are offered only where packages may be imported', () => {
  expect(promptNote({ typst: true, packages: true, theme: 'dark' })).toContain('cetz')
  expect(promptNote({ typst: true, packages: false, theme: 'dark' })).not.toContain('cetz')
  expect(promptNote({ typst: true, packages: false, theme: 'dark' })).toContain('cannot import packages')
})

test('typst blocks are drawn on the terminal\'s background, which the note names', () => {
  expect(promptNote({ typst: true, packages: true, theme: 'dark' })).toContain('dark background')
  expect(promptNote({ typst: true, packages: true, theme: 'light' })).toContain('show on light')
})
