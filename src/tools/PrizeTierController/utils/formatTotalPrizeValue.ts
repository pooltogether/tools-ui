import { calculateNumberOfPrizesForTierIndex } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'

export const formatTotalPrizeValue = (
  tiers: number[],
  bitRange: number,
  decimals: number
): number => {
  const totalPrizeValue = tiers.reduce(
    (a, b, i) => a + b * calculateNumberOfPrizesForTierIndex(bitRange, i),
    0
  )
  const formattedTotalPrizeValue = parseFloat(totalPrizeValue.toFixed(decimals))
  return formattedTotalPrizeValue
}

export const formatTotalPrizeValueFromFormValues = (
  formValues: EditPrizeTierFormValues,
  decimals: string
): string => {
  const bitRange = parseInt(formValues.bitRangeSize)
  const totalPrizeValue = formValues.tiers.reduce(
    (a, b, i) => a + Number(b.value) * calculateNumberOfPrizesForTierIndex(bitRange, i),
    0
  )
  const formattedTotalPrizeValue = parseFloat(totalPrizeValue.toFixed(parseInt(decimals)))
  return formattedTotalPrizeValue.toString()
}
