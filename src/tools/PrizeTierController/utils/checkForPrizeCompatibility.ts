import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { BigNumber } from 'ethers'

type CompatibilityError = 'prizeAmounts' | 'maxPicks' | 'bitRanges'

/**
 * Returns any compatibility errors between pool configs.
 * @param prizePoolConfigs - The configurations of all prize pools.
 * @returns Array of errors found
 */
export const checkForPrizeCompatibility = (prizePoolConfigs: {
  [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfig }
}): { valid: true } | { valid: false; errors: CompatibilityError[] } => {
  const errors: CompatibilityError[] = []
  const prizeAmounts: BigNumber[] = []
  const maxPicks: number[] = []
  const bitRanges: number[] = []

  // Fetching values from each prize config:
  Object.keys(prizePoolConfigs).forEach((chainId) => {
    Object.keys(prizePoolConfigs[chainId]).forEach((address) => {
      const prizeConfig = prizePoolConfigs[chainId][address] as PrizeTierConfig
      prizeAmounts.push(prizeConfig.prize)
      maxPicks.push(prizeConfig.maxPicksPerUser)
      bitRanges.push(prizeConfig.bitRangeSize)
    })
  })

  // Checking for prize amount errors:
  for (let i = 0; i < prizeAmounts.length - 1; i++) {
    if (!errors.includes('prizeAmounts') && !prizeAmounts[i].eq(prizeAmounts[i + 1])) {
      errors.push('prizeAmounts')
    }
  }

  // Checking for max picks errors:
  for (let i = 0; i < maxPicks.length - 1; i++) {
    if (!errors.includes('maxPicks') && maxPicks[i] !== maxPicks[i + 1]) {
      errors.push('maxPicks')
    }
  }

  // Checking for bit range errors:
  for (let i = 0; i < bitRanges.length - 1; i++) {
    if (!errors.includes('bitRanges') && bitRanges[i] !== bitRanges[i + 1]) {
      errors.push('bitRanges')
    }
  }

  if (errors.length === 0) {
    return { valid: true }
  } else {
    return { valid: false, errors }
  }
}
