import { formatUnformattedBigNumberForDisplay } from '@pooltogether/utilities'
import { PrizeTierConfig } from '@pooltogether/v4-client-js'
import { PrizeTierConfigV2 } from '@prizeTierController/interfaces'

interface PrettyConfig {
  bitRangeSize: string
  expiryDuration: string
  maxPicksPerUser: string
  prize: string
  tiers: string[]
  endTimestampOffset: string
}

interface PrettyConfigV2 extends PrettyConfig {
  dpr: string
}

export const formatPrettyConfig = (config: PrizeTierConfig, decimals: string) => {
  const prettyConfig: PrettyConfig = {
    bitRangeSize: config.bitRangeSize.toLocaleString(),
    expiryDuration: config.expiryDuration.toLocaleString() + 's',
    maxPicksPerUser: config.maxPicksPerUser.toLocaleString(),
    prize: formatUnformattedBigNumberForDisplay(config.prize, decimals),
    tiers: config.tiers.map((tier) => (tier / 10 ** 7).toLocaleString() + '%'),
    endTimestampOffset: config.endTimestampOffset.toLocaleString() + 's'
  }
  return prettyConfig
}

export const formatPrettyConfigV2 = (config: PrizeTierConfigV2, decimals: string) => {
  const prettyConfigV2: PrettyConfigV2 = {
    bitRangeSize: config.bitRangeSize.toLocaleString(),
    expiryDuration: config.expiryDuration.toLocaleString() + 's',
    maxPicksPerUser: config.maxPicksPerUser.toLocaleString(),
    prize: formatUnformattedBigNumberForDisplay(config.prize, decimals),
    tiers: config.tiers.map((tier) => (tier / 10 ** 7).toLocaleString() + '%'),
    endTimestampOffset: config.endTimestampOffset.toLocaleString() + 's',
    dpr: (config.dpr / 10 ** 7).toLocaleString() + '%'
  }
  return prettyConfigV2
}
