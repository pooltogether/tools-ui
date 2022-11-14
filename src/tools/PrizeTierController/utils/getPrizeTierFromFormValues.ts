import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { EditPrizeTierFormValues } from '@prizeTierController/interfaces'
import { BigNumberish } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

export const getPrizeTierFromFormValues = (
  formValues: Partial<EditPrizeTierFormValues>,
  decimals: BigNumberish
): Partial<PrizeTierConfig> => {
  const prizeTier: Partial<PrizeTierConfig> = {
    bitRangeSize: formValues.bitRangeSize,
    expiryDuration: formValues.expiryDuration,
    maxPicksPerUser: formValues.maxPicksPerUser,
    // TODO: Need prize amount -> tier percentage calculation from v4 utils
    tiers: formValues.tiers?.map((tier) => tier.value),
    prize: undefined
  }
  if (!!formValues.prize) {
    prizeTier.prize = parseUnits(formValues.prize, decimals)
  }
  return prizeTier
}
