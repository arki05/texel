// What a render comes to: a picture of whole cells, or why there is none.

/** A PNG on disk, and the cells it covers. */
export type Rendered = { file: string; columns: number; rows: number }

/** Why a run failed; `transient` when trying again could succeed. */
export type RenderFailure = { error: string; transient?: true }

export function isFailure(result: object): result is RenderFailure {
  return 'error' in result
}

/** A failure's first line, without typst's `error:`, cut to `max` characters. */
export function reason(failure: RenderFailure, max = 200) {
  const line = failure.error.split('\n')[0]!.replace(/^error:\s*/, '')
  return line.length > max ? `${line.slice(0, max - 1)}…` : line
}
