import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { BigNumberish } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

export const getPrizeTierFromFormValuesAndCurrent = (
  formValues: Partial<EditPrizeTierFormValues>,
  prizeTier: PrizeTierConfig,
  decimals: BigNumberish
): PrizeTierConfig => {
  return {
    bitRangeSize: formValues.bitRangeSize || prizeTier.bitRangeSize,
    expiryDuration: formValues.expiryDuration || prizeTier.expiryDuration,
    maxPicksPerUser: formValues.maxPicksPerUser || prizeTier.maxPicksPerUser,
    tiers: formValues.tiers || prizeTier.tiers,
    prize: formValues.prize ? parseUnits(formValues.prize, decimals) : prizeTier.prize
  }
}
