import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { ethers } from 'ethers'

interface PrizePoolCompatibilityErrors {
  chainId: number
  address: string
  errors: ('prizeAmount' | 'maxPicks' | 'bitRange')[]
}

interface SimplePrizePoolConfig {
  chainId: number
  address: string
  prizeAmount: number
  maxPicks: number
  bitRange: number
}

/**
 * Checks for any compatibility errors between pool configs.
 * @param prizePoolConfigs - The configurations of all prize pools.
 * @returns Array of errored prize pools.
 */
export const checkForPrizeCompatibilityErrors = (prizePoolConfigs: {
  [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfig }
}): PrizePoolCompatibilityErrors[] => {
  const compatibilityErrors: PrizePoolCompatibilityErrors[] = []
  const prizePoolConfigsArray: SimplePrizePoolConfig[] = []
  const prizeAmounts: number[] = []
  const maxPicks: number[] = []
  const bitRanges: number[] = []

  // Fetching values from each prize config:
  Object.keys(prizePoolConfigs).forEach((chainId) => {
    Object.keys(prizePoolConfigs[chainId]).forEach((address) => {
      const config = prizePoolConfigs[chainId][address] as PrizeTierConfig
      const prizeAmount = parseFloat(ethers.utils.formatEther(config.prize))
      prizePoolConfigsArray.push({
        chainId: parseInt(chainId),
        address,
        prizeAmount,
        maxPicks: config.maxPicksPerUser,
        bitRange: config.bitRangeSize
      })
      prizeAmounts.push(prizeAmount)
      maxPicks.push(config.maxPicksPerUser)
      bitRanges.push(config.bitRangeSize)
    })
  })

  // Checking for prize amount errors:
  if (!prizeAmounts.every((value) => value === prizeAmounts[0])) {
    const leastFrequentValue = getLeastFrequentValue(prizeAmounts)
    prizePoolConfigsArray.forEach((prizePool) => {
      if (prizePool.prizeAmount === leastFrequentValue) {
        compatibilityErrors.push({
          chainId: prizePool.chainId,
          address: prizePool.address,
          errors: ['prizeAmount']
        })
      }
    })
  }

  // Checking for max picks errors:
  if (!maxPicks.every((value) => value === maxPicks[0])) {
    const leastFrequentValue = getLeastFrequentValue(maxPicks)
    prizePoolConfigsArray.forEach((prizePool) => {
      if (prizePool.maxPicks === leastFrequentValue) {
        const prizePoolIndex = compatibilityErrors.findIndex(
          (entry) => entry.chainId === prizePool.chainId && entry.address === prizePool.address
        )
        if (prizePoolIndex !== -1) {
          compatibilityErrors[prizePoolIndex].errors.push('maxPicks')
        } else {
          compatibilityErrors.push({
            chainId: prizePool.chainId,
            address: prizePool.address,
            errors: ['maxPicks']
          })
        }
      }
    })
  }

  // Checking for bit range errors:
  if (!bitRanges.every((value) => value === bitRanges[0])) {
    const leastFrequentValue = getLeastFrequentValue(bitRanges)
    prizePoolConfigsArray.forEach((prizePool) => {
      if (prizePool.bitRange === leastFrequentValue) {
        const prizePoolIndex = compatibilityErrors.findIndex(
          (entry) => entry.chainId === prizePool.chainId && entry.address === prizePool.address
        )
        if (prizePoolIndex !== -1) {
          compatibilityErrors[prizePoolIndex].errors.push('bitRange')
        } else {
          compatibilityErrors.push({
            chainId: prizePool.chainId,
            address: prizePool.address,
            errors: ['bitRange']
          })
        }
      }
    })
  }

  return compatibilityErrors
}

// Helper function to get the least frequent value in array:
const getLeastFrequentValue = (array: number[]) => {
  let minCount = array.length + 1
  let result = -1
  const hashMap = new Map<number, number>()
  for (let i = 0; i < array.length; i++) {
    const value = array[i]
    if (hashMap.has(value)) {
      hashMap.set(value, hashMap.get(value) + 1)
    } else {
      hashMap.set(value, 1)
    }
  }
  hashMap.forEach((count, value) => {
    if (count < minCount) {
      result = value
      minCount = count
    }
  })
  return result
}
