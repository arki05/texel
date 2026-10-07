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

test('however tasks arrive, a task arriving as a slot passes to a waiter waits too', async () => {
  // Tasks start and run for seeded-random numbers of microtask ticks.
  let seed = 7
  const random = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31
  const ticks = async () => {
    for (let i = Math.floor(random() * 4); i > 0; i--) await Promise.resolve()
  }
  let most = 0
  for (let trial = 0; trial < 300; trial++) {
    const limiter = new Limiter(1)
    let running = 0
    const task = async () => {
      running++
      most = Math.max(most, running)
      await ticks()
      running--
    }
    await Promise.all(Array.from({ length: 6 }, () => ticks().then(() => limiter.run(task))))
  }
  expect(most).toBe(1)
})

test('a failing task frees its place', async () => {
  const limiter = new Limiter(1)
  await expect(limiter.run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom')
  expect(await limiter.run(async () => 'next')).toBe('next')
})
