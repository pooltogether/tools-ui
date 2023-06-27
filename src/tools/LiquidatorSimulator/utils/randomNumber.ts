import { max } from 'date-fns'
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
  if (chaosLevel === ChaosLevel.None || value === BigInt(0)) {
    return value
  }

  let percent = 0
  let skipThreshold = 0
  switch (chaosLevel) {
    case ChaosLevel.Low:
      percent = 1
      skipThreshold = 0.75
      break
    case ChaosLevel.Medium:
      percent = 3
      skipThreshold = 0.5
      break
    case ChaosLevel.High:
      percent = 10
      skipThreshold = 0.25
      break
  }

  const skipChance = randomWithSeed(seed + 2)
  if (skipChance < skipThreshold) {
    return value
  }

  const random = randomWithSeed(seed + Number(value) + percent)
  const direction = randomWithSeed(seed + 1)
  const maxDelta = value - (value * BigInt(100 + percent)) / BigInt(100)
  const delta = maxDelta - (maxDelta * BigInt(Math.round(random * 100000))) / BigInt(100000)

  console.log({ value, maxDelta, delta, random, percent })
  const scaledValue = direction > 0.5 ? value + delta : value - delta
  return scaledValue
}
