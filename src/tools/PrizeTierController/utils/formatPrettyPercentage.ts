import { DPR_DECIMALS } from '@prizeTierController/config'

export const formatPrettyPercentage = (
  value: number,
  options?: { maximumFractionDigits?: number }
) => {
  return (value / 10 ** DPR_DECIMALS).toLocaleString('en', {
    style: 'percent',
    maximumFractionDigits: options?.maximumFractionDigits ?? 4
  })
}
