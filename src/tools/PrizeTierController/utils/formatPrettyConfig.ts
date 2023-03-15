import { formatUnformattedBigNumberForDisplay } from '@pooltogether/utilities'
import { PrizeTierConfigV2, PrettyConfig } from '@prizeTierController/interfaces'
import {
  formatPrettyDprPercentage,
  formatPrettyTierPercentage
} from '@prizeTierController/utils/formatPrettyPercentage'

export const formatPrettyConfig = (config: PrizeTierConfigV2, decimals: string): PrettyConfig => {
  const bitRangeSize = config.bitRangeSize.toLocaleString()
  const expiryDuration = config.expiryDuration.toLocaleString() + 's'
  const maxPicksPerUser = config.maxPicksPerUser.toLocaleString()
  const prize = formatUnformattedBigNumberForDisplay(config.prize, decimals)
  const tiers = config.tiers.map((tier) => formatPrettyTierPercentage(tier))
  const endTimestampOffset = config.endTimestampOffset.toLocaleString() + 's'
  if (!!config.dpr) {
    const dpr = formatPrettyDprPercentage(config.dpr)
    return { bitRangeSize, expiryDuration, maxPicksPerUser, prize, tiers, endTimestampOffset, dpr }
  } else {
    return { bitRangeSize, expiryDuration, maxPicksPerUser, prize, tiers, endTimestampOffset }
  }
}
