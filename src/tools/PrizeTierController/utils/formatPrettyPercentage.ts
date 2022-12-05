import { DPR_DECIMALS } from '@prizeTierController/config'

export const formatPrettyPercentage = (value: number) => {
  return (value / 10 ** (DPR_DECIMALS + 2)).toLocaleString('en', {
    style: 'percent',
    maximumFractionDigits: 4
  })
}
