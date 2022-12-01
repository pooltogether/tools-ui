import { calculate } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues, PrizeTierConfigV2 } from '@prizeTierController/interfaces'
import { BigNumberish } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

export const formatPrizeTierFromFormValues = (
  formValues: Partial<EditPrizeTierFormValues>,
  decimals: BigNumberish
): Partial<PrizeTierConfigV2> => {
  const prizeTier: Partial<PrizeTierConfigV2> = {
    bitRangeSize: parseInt(formValues.bitRangeSize),
    expiryDuration: parseInt(formValues.expiryDuration),
    maxPicksPerUser: parseInt(formValues.maxPicksPerUser),
    endTimestampOffset: parseInt(formValues.endTimestampOffset),
    prize: undefined,
    tiers: undefined,
    dpr: undefined
  }
  if (!!formValues.prize) {
    prizeTier.prize = parseUnits(formValues.prize, decimals)
  }
  if (!!formValues.tiers && !!formValues.bitRangeSize && !!formValues.prize) {
    prizeTier.tiers = formValues.tiers.map((tier, i) => {
      if (!!tier.value) {
        return calculate
          .calculateTierPercentageForPrize(
            i,
            parseUnits(tier.value.toString(), decimals),
            parseInt(formValues.bitRangeSize),
            prizeTier.prize
          )
          .toNumber()
      } else {
        return 0
      }
    })
  }
  if (!!formValues.dpr) {
    prizeTier.dpr = parseFloat(formValues.dpr) * 10 ** 7
  }
  return prizeTier
}
