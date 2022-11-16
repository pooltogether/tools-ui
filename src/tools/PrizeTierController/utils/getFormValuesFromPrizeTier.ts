import { PrizeTierConfig, calculate } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { BigNumberish } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

export const getFormValuesFromPrizeTier = (
  prizeTier: Partial<PrizeTierConfig>,
  decimals: BigNumberish,
  options?: { round?: boolean }
): Partial<EditPrizeTierFormValues> => {
  const formValues: Partial<EditPrizeTierFormValues> = {
    bitRangeSize: prizeTier.bitRangeSize,
    expiryDuration: prizeTier.expiryDuration,
    maxPicksPerUser: prizeTier.maxPicksPerUser,
    tiers: undefined,
    prize: undefined
  }
  if (!!prizeTier.prize) {
    const formattedPrize = formatUnits(prizeTier.prize, decimals)
    formValues.prize = options?.round
      ? parseFloat(parseFloat(formattedPrize).toFixed(2)).toString()
      : formattedPrize
  }
  if (!!prizeTier.tiers && !!prizeTier.bitRangeSize && !!prizeTier.prize) {
    formValues.tiers = prizeTier.tiers.map((tier, i) => {
      const calculatedPrize = parseFloat(
        formatUnits(
          calculate.calculatePrizeForTierPercentage(
            i,
            tier,
            prizeTier.bitRangeSize,
            prizeTier.prize
          ),
          decimals
        )
      )
      return {
        value: options?.round ? parseFloat(calculatedPrize.toFixed(2)) : calculatedPrize
      }
    })
  }
  return formValues
}
