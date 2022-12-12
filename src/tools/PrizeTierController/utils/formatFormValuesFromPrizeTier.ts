import { calculate } from '@pooltogether/v4-utils-js'
import { DPR_DECIMALS } from '@prizeTierController/config'
import { fallbackFormValues, fallbackFormValuesV2 } from '@prizeTierController/fallbacks'
import { EditPrizeTierFormValues, PrizeTierConfigV2 } from '@prizeTierController/interfaces'
import { BigNumberish } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

// TODO: try and clean up some rounding/conversions/formatting once `formatCombinedPrizeTier` handles the last decimal inaccuracies

export const formatFormValuesFromPrizeTier = (
  prizeTier: Partial<PrizeTierConfigV2>,
  decimals: BigNumberish,
  options?: { round?: boolean; isV2?: boolean }
): Partial<EditPrizeTierFormValues> => {
  if (!!prizeTier) {
    const formValues: Partial<EditPrizeTierFormValues> = {
      bitRangeSize: prizeTier.bitRangeSize?.toString(),
      expiryDuration: prizeTier.expiryDuration?.toString(),
      maxPicksPerUser: prizeTier.maxPicksPerUser?.toString(),
      endTimestampOffset: prizeTier.endTimestampOffset?.toString(),
      prize: undefined,
      tiers: undefined,
      dpr: undefined
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
          calculate.calculatePrizeForTierPercentage(
            i,
            tier,
            prizeTier.bitRangeSize,
            prizeTier.prize
          ),
          decimals
        )
        return {
          value: options?.round
            ? parseFloat(parseFloat(calculatedPrize).toFixed(Number(decimals) - 1)).toString()
            : calculatedPrize
        }
      })
    }
    if (!!prizeTier.dpr) {
      formValues.dpr = formatUnits(prizeTier.dpr, DPR_DECIMALS - 2)
    }
    return formValues
  } else {
    return options?.isV2 ? fallbackFormValuesV2 : fallbackFormValues
  }
}
