import { PrizeTierConfig, calculate } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { BigNumberish } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

export const formatFormValuesFromPrizeTier = (
  prizeTier: Partial<PrizeTierConfig>,
  decimals: BigNumberish,
  options?: { round?: boolean }
): Partial<EditPrizeTierFormValues> => {
  const formValues: Partial<EditPrizeTierFormValues> = {
    bitRangeSize: prizeTier.bitRangeSize.toString(),
    expiryDuration: prizeTier.expiryDuration.toString(),
    maxPicksPerUser: prizeTier.maxPicksPerUser.toString(),
    endTimestampOffset: prizeTier.endTimestampOffset.toString(),
    prize: undefined,
    tiers: undefined
  }
  if (!!prizeTier.prize) {
    const formattedPrize = formatUnits(prizeTier.prize, decimals)
    formValues.prize = options?.round
      ? parseFloat(parseFloat(formattedPrize).toFixed(Number(decimals) - 1)).toString()
      : formattedPrize
  }
  if (!!prizeTier.tiers && !!prizeTier.bitRangeSize && !!prizeTier.prize) {
    formValues.tiers = prizeTier.tiers.map((tier, i) => {
      const calculatedPrize = formatUnits(
        calculate.calculatePrizeForTierPercentage(i, tier, prizeTier.bitRangeSize, prizeTier.prize),
        decimals
      )
      return {
        value: options?.round
          ? parseFloat(parseFloat(calculatedPrize).toFixed(Number(decimals) - 1)).toString()
          : calculatedPrize
      }
    })
  }
  return formValues
}
