import { PrizeTierConfig } from '@pooltogether/v4-utils-js'

/**
 * Returns true if the new prize tier configuration is not the same as the new one.
 * @param oldConfig - The old unedited prize configuration.
 * @param newConfig - The new potentially edited prize configuration.
 * @returns True or False (Boolean)
 */
export const checkForPrizeEdits = (
  oldConfig: PrizeTierConfig,
  newConfig: PrizeTierConfig
): boolean => {
  if (oldConfig.bitRangeSize !== newConfig.bitRangeSize) {
    return true
  } else if (oldConfig.expiryDuration !== newConfig.expiryDuration) {
    return true
  } else if (oldConfig.maxPicksPerUser !== newConfig.maxPicksPerUser) {
    return true
  } else if (!oldConfig.prize.eq(newConfig.prize)) {
    return true
  } else if (oldConfig.endTimestampOffset !== newConfig.endTimestampOffset) {
    return true
  }
  oldConfig.tiers.forEach((tier, i) => {
    if (tier !== newConfig.tiers[i]) {
      return true
    }
  })
  return false
}
