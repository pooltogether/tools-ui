import { Token } from '@pooltogether/hooks'
import { PrizeTierConfig, PrizeTier } from '@pooltogether/v4-utils-js'
import { Contract } from 'ethers'

export interface PrizeTierConfigV2 extends PrizeTierConfig {
  dpr?: number
}

// Once V1 is entirely deprecated, this can be removed and the PrizeTierV2 type from v4-utils-js can be used.
export interface PrizeTierV2 extends PrizeTier {
  dpr?: number
}

export interface PrizeTierHistoryContract {
  id: string
  chainId: number
  address: string
  token: Token
  contract: Contract
  isV2?: boolean
}

export interface EditPrizeTierFormValues {
  bitRangeSize: string
  expiryDuration: string
  maxPicksPerUser: string
  endTimestampOffset: string
  prize: string
  tiers: { value: string }[]
  dpr?: string
}

export interface PrizeTierEditsCheck {
  edited: boolean
  bitRangeSize: boolean
  expiryDuration: boolean
  maxPicksPerUser: boolean
  endTimestampOffset: boolean
  prize: boolean
  tiers: boolean[]
  dpr: boolean
}

export interface PrizePoolEditHistory {
  prizeTierHistoryContract: PrizeTierHistoryContract
  oldConfig: PrizeTierConfigV2
  newConfig: PrizeTierConfigV2
  edits: PrizeTierEditsCheck
}

export interface PrettyConfig {
  bitRangeSize: string
  expiryDuration: string
  maxPicksPerUser: string
  prize: string
  tiers: string[]
  endTimestampOffset: string
  dpr?: string
}
