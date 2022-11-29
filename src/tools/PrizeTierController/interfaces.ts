import { PrizePool, PrizeTierConfig } from '@pooltogether/v4-client-js'

export interface EditPrizeTierFormValues {
  bitRangeSize: string
  expiryDuration: string
  maxPicksPerUser: string
  endTimestampOffset: string
  prize: string
  tiers: { value: string }[]
}

export interface PrizeTierEditsCheck {
  edited: boolean
  bitRangeSize: boolean
  expiryDuration: boolean
  maxPicksPerUser: boolean
  endTimestampOffset: boolean
  prize: boolean
  tiers: boolean[]
}

export interface PrizePoolEditHistory {
  prizePool: PrizePool
  oldConfig: PrizeTierConfig
  newConfig: PrizeTierConfig
  edits: PrizeTierEditsCheck
}
