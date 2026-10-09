// Remembers what each keyed run of work settled to, for as long as the module
// is loaded, so a redraw asks typst nothing it already asked.

import { isFailure, type RenderFailure } from '../result'

/** How many times work that failed transiently is tried before its failure is kept. */
const ATTEMPTS = 2

export class Memo {
  private readonly running = new Map<string, Promise<object>>()
  private readonly settled = new Map<string, object>()
  private readonly failures = new Map<string, number>()

  /** What `key` settled to, without waiting: undefined while it runs, or before it ran. */
  get<T extends object>(key: string): T | RenderFailure | undefined {
    return this.settled.get(key) as T | RenderFailure | undefined
  }

  /** Records what `key` is known to be without running anything (a picture already on disk). */
  settle(key: string, value: object) {
    this.settled.set(key, value)
  }

  /**
   * Runs `work` once per key. A success, or typst's own error, is kept: the
   * same source fails the same way. A transient failure (a process cut short)
   * is forgotten so a later draw tries again, until ATTEMPTS have failed;
   * then it is kept too, so a redraw can never retry forever.
   */
  once<T extends object>(key: string, work: () => Promise<T | RenderFailure>): Promise<T | RenderFailure> {
    const settled = this.get<T>(key)
    if (settled) return Promise.resolve(settled)
    const running = this.running.get(key) as Promise<T | RenderFailure> | undefined
    if (running) return running
    const run = work()
      .catch((error: unknown): RenderFailure => ({ error: String(error), transient: true }))
      .then(result => {
        this.running.delete(key)
        const failures = isFailure(result) && result.transient ? (this.failures.get(key) ?? 0) + 1 : 0
        if (failures > 0 && failures < ATTEMPTS) this.failures.set(key, failures)
        else this.settle(key, result)
        return result
      })
    this.running.set(key, run)
    return run
  }
}
