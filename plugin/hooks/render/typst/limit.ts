/** Runs at most `max` tasks at once; the rest wait their turn, first come first served. */
export class Limiter {
  private running = 0
  private readonly waiting: (() => void)[] = []

  constructor(private readonly max: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.running < this.max) this.running++
    // A waiter is handed its slot already counted: none frees up in between
    // for a newcomer to take as well.
    else await new Promise<void>(resolve => this.waiting.push(resolve))
    try {
      return await task()
    } finally {
      const next = this.waiting.shift()
      if (next) next()
      else this.running--
    }
  }
}
