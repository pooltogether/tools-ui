import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { BigNumber } from 'ethers'

type CompatibilityError = 'prizeAmount'

/**
 * Returns any compatibility errors between pool configs.
 * @param prizePoolConfigs - The configurations of all prize pools.
 * @returns Array of errors found
 */
export const checkForPrizeCompatibility = (prizePoolConfigs: {
  [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfig }
}): { valid: true } | { valid: false; errors: CompatibilityError[] } => {
  const errors: CompatibilityError[] = []

  // Checking if all prize configs have the same prize amount:
  let basePrizeAmount: BigNumber | undefined = undefined
  Object.keys(prizePoolConfigs).forEach((chainId) => {
    Object.keys(prizePoolConfigs[chainId]).forEach((address) => {
      const prizeConfig = prizePoolConfigs[chainId][address] as PrizeTierConfig
      if (basePrizeAmount === undefined) {
        basePrizeAmount = prizeConfig.prize
      } else if (!prizeConfig.prize.eq(basePrizeAmount) && !errors.includes('prizeAmount')) {
        errors.push('prizeAmount')
      }
    })
  })

  if (errors.length === 0) {
    return { valid: true }
  } else {
    return { valid: false, errors }
  }
}
