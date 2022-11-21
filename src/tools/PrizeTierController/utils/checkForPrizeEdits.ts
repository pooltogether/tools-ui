import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { PrizeTierEditsCheck } from '@prizeTierController/interfaces'

/**
 * Checks if the new prize tier configuration is different from the old one.
 * @param oldConfig - The old unedited prize configuration.
 * @param newConfig - The new potentially edited prize configuration.
 * @returns Object with a boolean outcomes for each prize tier attribute.
 */
export const checkForPrizeEdits = (
  oldConfig: PrizeTierConfig,
  newConfig: PrizeTierConfig
): PrizeTierEditsCheck => {
  const result: PrizeTierEditsCheck = {
    edited: false,
    bitRangeSize: false,
    expiryDuration: false,
    maxPicksPerUser: false,
    prize: false,
    tiers: Array(16).fill(false)
  }
  if (oldConfig.bitRangeSize !== newConfig.bitRangeSize) {
    result.edited = true
    result.bitRangeSize = true
  } else if (oldConfig.expiryDuration !== newConfig.expiryDuration) {
    result.edited = true
    result.expiryDuration = true
  } else if (oldConfig.maxPicksPerUser !== newConfig.maxPicksPerUser) {
    result.edited = true
    result.maxPicksPerUser = true
  } else if (!oldConfig.prize.eq(newConfig.prize)) {
    result.edited = true
    result.prize = true
  }
  oldConfig.tiers.forEach((tier, i) => {
    if (tier !== newConfig.tiers[i]) {
      result.edited = true
      result.tiers[i] = true
    }
  })
  return result
}
