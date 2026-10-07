import { expect, test } from 'claude-code/testing'

import { Limiter } from './limit'

test('a limiter runs no more than its limit at once, and runs every task', async () => {
  const limiter = new Limiter(2)
  let running = 0
  let most = 0
  const task = (n: number) => async () => {
    running++
    most = Math.max(most, running)
    await Promise.resolve()
    await Promise.resolve()
    running--
    return n
  }
  const results = await Promise.all([1, 2, 3, 4, 5].map(n => limiter.run(task(n))))
  expect(results).toEqual([1, 2, 3, 4, 5])
  expect(most).toBe(2)
})

test('a failing task frees its place', async () => {
  const limiter = new Limiter(1)
  await expect(limiter.run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom')
  expect(await limiter.run(async () => 'next')).toBe('next')
})
