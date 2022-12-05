import { EditPrizeTierFormValues, PrizeTierConfigV2 } from '@prizeTierController/interfaces'
import { BigNumber } from 'ethers'

export const fallbackConfig: PrizeTierConfigV2 = {
  bitRangeSize: 1,
  expiryDuration: 5184000,
  maxPicksPerUser: 1,
  endTimestampOffset: 900,
  prize: BigNumber.from('0'),
  tiers: Array(16).fill(0),
  dpr: 0
}

export const fallbackFormValues: EditPrizeTierFormValues = {
  bitRangeSize: '1',
  expiryDuration: '5184000',
  maxPicksPerUser: '1',
  endTimestampOffset: '900',
  prize: '0',
  tiers: Array(16).fill({ value: '0' })
}

export const fallbackFormValuesV2: EditPrizeTierFormValues = {
  ...fallbackFormValues,
  dpr: '0'
}
