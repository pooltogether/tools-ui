import { formatUnformattedBigNumberForDisplay } from '@pooltogether/utilities'
import { PrizeTierConfig } from '@pooltogether/v4-client-js'

interface PrettyConfig {
  bitRangeSize: string
  expiryDuration: string
  maxPicksPerUser: string
  prize: string
  tiers: string[]
  endTimestampOffset: string
}

export const formatPrettyConfig = (config: PrizeTierConfig, decimals: string) => {
  const prettyConfig: PrettyConfig = {
    bitRangeSize: config.bitRangeSize.toLocaleString(),
    expiryDuration: config.expiryDuration.toLocaleString() + 's',
    maxPicksPerUser: config.maxPicksPerUser.toLocaleString(),
    prize: formatUnformattedBigNumberForDisplay(config.prize, decimals),
    tiers: config.tiers.map((tier) => (tier / 10 ** 9).toLocaleString() + '%'),
    endTimestampOffset: config.endTimestampOffset.toLocaleString() + 's'
  }
  return prettyConfig
}
