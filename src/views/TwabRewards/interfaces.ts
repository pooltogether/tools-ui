import { BigNumber } from '@ethersproject/bignumber'

export interface Promotion {
  token: string
  tokensPerEpoch: BigNumber
  startTimestamp: number
  epochDuration: number
  numberOfEpochs: number
}

export interface PromotionId {
  account: string
}

export interface PromotionUpdate extends PromotionId {
  numberOfEpochs: number
}

export interface PromotionFund extends PromotionId {
  numberOfEpochs: number
}

export interface PromotionFormValues {
  token: string
  tokensPerEpoch: string
  startTimestamp: number
  epochDuration: number
  numberOfEpochs: number
  dateString?: string
  timeString?: string
}
