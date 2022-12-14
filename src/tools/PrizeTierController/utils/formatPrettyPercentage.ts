import { formatNumberForDisplay } from '@pooltogether/utilities'
import { DPR_DECIMALS, TIER_DECIMALS } from '@prizeTierController/config'

export const formatPrettyPercentage = (
  value: number,
  decimals: number,
  options?: { maximumFractionDigits?: number }
) => {
  return formatNumberForDisplay(value / 10 ** decimals, {
    style: 'percent',
    maximumFractionDigits: options?.maximumFractionDigits ?? 4
  })
}

export const formatPrettyDprPercentage = (
  value: number,
  options?: { maximumFractionDigits?: number }
) => {
  return formatPrettyPercentage(value, DPR_DECIMALS, options)
}

export const formatPrettyTierPercentage = (
  value: number,
  options?: { maximumFractionDigits?: number }
) => {
  return formatPrettyPercentage(value, TIER_DECIMALS, options ?? { maximumFractionDigits: 3 })
}
