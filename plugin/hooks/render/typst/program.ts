// texel's contract with texel.typ: the program that lays out a typst block,
// as a fixed main file and the inputs it reads. Everything that varies is an
// input; only the block's own markup is source. Pure: jobs in, programs out.

import type { Grid } from '../../layout/geometry'
import type { TypstJob } from '../renderer'

/** How typst blocks are set: on which grid, in what colour (six hex digits). */
export type TypstStyle = { grid: Grid; color: string }

/** One run of typst: a main file and the inputs it reads. */
export type Program = { source: string; inputs: Record<string, string> }

/** The input that ties a program to the transcript's width. */
const WIDTH = 'max-columns'

/** The program that lays out `job` through texel.typ's `typst-block`. */
export function program(job: TypstJob, { grid, color }: TypstStyle): Program {
  return {
    source: `#import "/texel.typ": *\n#typst-block[\n${withoutPageRules(job.typst)}\n]\n`,
    inputs: {
      'cell-width': String(grid.cellWidth),
      'cell-height': String(grid.cellHeight),
      'x-height': String(grid.xHeight),
      foreground: color,
      [WIDTH]: String(job.maxColumns),
    },
  }
}

/** `program` as it would be at any width: what a block drawn at its natural size is known by. */
export function widthFree({ source, inputs }: Program): Program {
  const { [WIDTH]: _, ...rest } = inputs
  return { source, inputs: rest }
}

// A page rule in markup (`#set page(`) or at the start of a statement in code.
const PAGE_RULE = /(?:#|(?<=[{;]\s*|^\s*))set\s+page\s*\(/gm

/**
 * `typst` without its `set page(…)` rules, each blanked up to its closing
 * parenthesis but for its line breaks, so typst's line numbers still hold.
 * texel sizes the page itself, and typst allows no page rule in the box a
 * block is measured in; a block written as a document of its own has one.
 */
export function withoutPageRules(typst: string) {
  let out = ''
  let from = 0
  for (const match of typst.matchAll(PAGE_RULE)) {
    if (match.index < from) continue
    const end = closingParen(typst, match.index + match[0].length)
    if (end === undefined) break
    out += typst.slice(from, match.index) + typst.slice(match.index, end).replace(/[^\n]/g, '')
    from = end
  }
  return out + typst.slice(from)
}

// Just past the parenthesis that closes one opened before `at`, undefined
// when none does. Strings and comments in code are skipped, and in content
// (`[…]`) a parenthesis is text.
function closingParen(typst: string, at: number) {
  const open: string[] = ['(']
  for (let i = at; i < typst.length; i++) {
    const c = typst[i]
    const inCode = open.at(-1) === '('
    if (c === '\\') i++
    else if (inCode && c === '"') {
      for (i++; i < typst.length && typst[i] !== '"'; i++) if (typst[i] === '\\') i++
    }
    else if (inCode && typst.startsWith('//', i)) i = typst.indexOf('\n', i) < 0 ? typst.length : typst.indexOf('\n', i)
    else if (inCode && typst.startsWith('/*', i)) i = typst.indexOf('*/', i) < 0 ? typst.length : typst.indexOf('*/', i) + 1
    else if ((inCode && c === '(') || c === '[') open.push(c)
    else if ((c === ')' && open.at(-1) === '(') || (c === ']' && open.at(-1) === '[')) {
      open.pop()
      if (!open.length) return i + 1
    }
  }
  return undefined
}

/**
 * Whether typst markup imports or includes a package (`"@preview/..."`),
 * which typst downloads: in markup or in code, the path in parentheses or
 * not. A path held in a variable goes unseen.
 */
export function importsPackage(typst: string) {
  return /\b(?:import|include)\s*\(?\s*"@[\w-]+\//.test(typst)
}
