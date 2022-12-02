import { formatUnformattedBigNumberForDisplay } from '@pooltogether/utilities'
import { PrizeTierConfigV2 } from '@prizeTierController/interfaces'
import { formatPrettyPercentage } from '@prizeTierController/utils/formatPrettyPercentage'

interface PrettyConfig {
  bitRangeSize: string
  expiryDuration: string
  maxPicksPerUser: string
  prize: string
  tiers: string[]
  endTimestampOffset: string
  dpr?: string
}

export const formatPrettyConfig = (config: PrizeTierConfigV2, decimals: string): PrettyConfig => {
  const bitRangeSize = config.bitRangeSize.toLocaleString()
  const expiryDuration = config.expiryDuration.toLocaleString() + 's'
  const maxPicksPerUser = config.maxPicksPerUser.toLocaleString()
  const prize = formatUnformattedBigNumberForDisplay(config.prize, decimals)
  const tiers = config.tiers.map((tier) => formatPrettyPercentage(tier))
  const endTimestampOffset = config.endTimestampOffset.toLocaleString() + 's'
  if (!!config.dpr) {
    const dpr = formatPrettyPercentage(config.dpr)
    return { bitRangeSize, expiryDuration, maxPicksPerUser, prize, tiers, endTimestampOffset, dpr }
  } else {
    return { bitRangeSize, expiryDuration, maxPicksPerUser, prize, tiers, endTimestampOffset }
  }
}
