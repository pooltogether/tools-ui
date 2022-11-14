import { PrizeTierConfig, calculate } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { BigNumberish } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

export const getPrizeTierFromFormValuesAndCurrent = (
  formValues: Partial<EditPrizeTierFormValues>,
  prizeTier: PrizeTierConfig,
  decimals: BigNumberish
): PrizeTierConfig => {
  const editedPrizeTier: PrizeTierConfig = {
    bitRangeSize: formValues.bitRangeSize || prizeTier.bitRangeSize,
    expiryDuration: formValues.expiryDuration || prizeTier.expiryDuration,
    maxPicksPerUser: formValues.maxPicksPerUser || prizeTier.maxPicksPerUser,
    tiers:
      formValues.tiers && formValues.bitRangeSize && formValues.prize
        ? formValues.tiers.map((tier, i) =>
            parseUnits(
              calculate
                .calculateTierPercentageForPrize(
                  i,
                  tier.value,
                  formValues.bitRangeSize,
                  prizeTier.prize
                )
                .toString(),
              decimals
            ).toNumber()
          )
        : prizeTier.tiers,
    prize: formValues.prize ? parseUnits(formValues.prize, decimals) : prizeTier.prize,
    endTimestampOffset: 5_184_000 // TODO: confirm actual value
  }
  return editedPrizeTier
}
