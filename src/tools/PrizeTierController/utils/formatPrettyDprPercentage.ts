import { formatNumberForDisplay } from '@pooltogether/utilities'
import { DPR_DECIMALS } from '@prizeTierController/config'

export const formatPrettyDprPercentage = (
  value: number,
  options?: { maximumFractionDigits?: number }
) => {
  return formatNumberForDisplay(value / 10 ** DPR_DECIMALS, {
    style: 'percent',
    maximumFractionDigits: options?.maximumFractionDigits ?? 4
  })
}
