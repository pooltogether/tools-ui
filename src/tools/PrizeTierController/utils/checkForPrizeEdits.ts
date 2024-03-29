import { fallbackConfig } from '@prizeTierController/fallbacks'
import { PrizeTierConfigV2, PrizeTierEditsCheck } from '@prizeTierController/interfaces'

/**
 * Checks if the new prize tier configuration is different from the old one.
 * @param oldConfig - The old unedited prize configuration.
 * @param newConfig - The new potentially edited prize configuration.
 * @returns Object with a boolean outcomes for each prize tier attribute.
 */
export const checkForPrizeEdits = (
  oldConfig: Partial<PrizeTierConfigV2>,
  newConfig: Partial<PrizeTierConfigV2>
): PrizeTierEditsCheck => {
  const result: PrizeTierEditsCheck = {
    edited: false,
    bitRangeSize: false,
    expiryDuration: false,
    maxPicksPerUser: false,
    endTimestampOffset: false,
    prize: false,
    tiers: Array(16).fill(false),
    dpr: false
  }
  if (!!newConfig) {
    if (oldConfig === undefined) {
      if (newConfig.bitRangeSize !== fallbackConfig.bitRangeSize) {
        result.edited = true
        result.bitRangeSize = true
      }
      if (newConfig.expiryDuration !== fallbackConfig.expiryDuration) {
        result.edited = true
        result.expiryDuration = true
      }
      if (newConfig.maxPicksPerUser !== fallbackConfig.maxPicksPerUser) {
        result.edited = true
        result.maxPicksPerUser = true
      }
      if (newConfig.endTimestampOffset !== fallbackConfig.endTimestampOffset) {
        result.edited = true
        result.endTimestampOffset = true
      }
      if (!newConfig.prize.eq(fallbackConfig.prize)) {
        result.edited = true
        result.prize = true
      }
      newConfig.tiers.forEach((tier, i) => {
        if (tier !== fallbackConfig.tiers[i]) {
          result.edited = true
          result.tiers[i] = true
        }
      })
      if (!!newConfig.dpr && newConfig.dpr !== fallbackConfig.dpr) {
        result.edited = true
        result.dpr = true
      }
    } else {
      if (oldConfig.bitRangeSize !== newConfig.bitRangeSize) {
        result.edited = true
        result.bitRangeSize = true
      }
      if (oldConfig.expiryDuration !== newConfig.expiryDuration) {
        result.edited = true
        result.expiryDuration = true
      }
      if (oldConfig.maxPicksPerUser !== newConfig.maxPicksPerUser) {
        result.edited = true
        result.maxPicksPerUser = true
      }
      if (oldConfig.endTimestampOffset !== newConfig.endTimestampOffset) {
        result.edited = true
        result.endTimestampOffset = true
      }
      if (!oldConfig.prize.eq(newConfig.prize)) {
        result.edited = true
        result.prize = true
      }
      oldConfig.tiers.forEach((tier, i) => {
        if (tier !== newConfig.tiers[i]) {
          result.edited = true
          result.tiers[i] = true
        }
      })
      if (oldConfig.dpr !== newConfig.dpr) {
        result.edited = true
        result.dpr = true
      }
    }
  }
  return result
}
