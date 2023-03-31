import { ChaosLevel } from '../interfaces'

const RNG_SEED = 1000

export function randomNumber() {
  return randomWithSeed(RNG_SEED)
}

export function randomWithSeed(seed: number) {
  var t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/**
 * Randomly increases or decreases a value by an amount between -percent and +percent
 * @param value
 * @param seed
 * @param range
 */
export function applyRandomScaling(value: bigint, seed: number, chaosLevel: ChaosLevel) {
  if (chaosLevel === ChaosLevel.None) {
    return value
  }

  let percent = 0
  switch (chaosLevel) {
    case ChaosLevel.Low:
      percent = 1
      break
    case ChaosLevel.Medium:
      percent = 3
      break
    case ChaosLevel.High:
      percent = 10
      break
  }

  const random = randomWithSeed(seed)
  const range = (value * BigInt(percent)) / BigInt(100)
  const scaled = value + (range * BigInt(Math.round(random * 100000))) / BigInt(10000)

  console.log({ value, percent, range, scaled })
  return scaled
}
