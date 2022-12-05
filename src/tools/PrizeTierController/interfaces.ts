import { Token } from '@pooltogether/hooks'
import { PrizeTierConfig } from '@pooltogether/v4-client-js'
import { Contract } from 'ethers'

export interface PrizeTierHistoryContract {
  id: string
  chainId: number
  address: string
  token: Token
  contract: Contract
}

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
  prizeTierHistoryContract: PrizeTierHistoryContract
  oldConfig: PrizeTierConfig
  newConfig: PrizeTierConfig
  edits: PrizeTierEditsCheck
}
