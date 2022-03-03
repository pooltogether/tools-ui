import { BigNumber } from '@ethersproject/bignumber'

export interface Delegation {
  balance: BigNumber
  delegatee: string
  delegation: string
  length: number
  lockUntil: BigNumber
  wasCreated: boolean
}
