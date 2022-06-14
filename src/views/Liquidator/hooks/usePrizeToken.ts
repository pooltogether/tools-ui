import { POOL } from '@constants/pool'

export const usePrizeToken = (chainId: number) => {
  return POOL[chainId]
}
