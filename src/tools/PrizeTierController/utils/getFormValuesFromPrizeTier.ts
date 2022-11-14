import { PrizeTierConfig, calculate } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { BigNumberish } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

export const getFormValuesFromPrizeTier = (
  prizeTier: Partial<PrizeTierConfig>,
  decimals: BigNumberish
): Partial<EditPrizeTierFormValues> => {
  const formValues: Partial<EditPrizeTierFormValues> = {
    bitRangeSize: prizeTier.bitRangeSize,
    expiryDuration: prizeTier.expiryDuration,
    maxPicksPerUser: prizeTier.maxPicksPerUser,
    tiers: undefined,
    prize: undefined
  }
  if (prizeTier.prize) {
    formValues.prize = formatUnits(prizeTier.prize, decimals)
  }
  if (prizeTier.tiers && prizeTier.bitRangeSize && prizeTier.prize) {
    formValues.tiers = prizeTier.tiers.map((tier, i) => {
      return {
        value: Number(
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
      }
    })
  }
  return formValues
}
