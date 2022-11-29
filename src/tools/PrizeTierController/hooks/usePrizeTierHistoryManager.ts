import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryManager = (prizePool: PrizePool) => {
  return useQuery(['usePrizeTierHistoryManager', prizePool?.id()], async () => {
    const manager: string = await prizePool.prizeTierHistoryContract.functions.manager()

    return {
      manager
    }
  })
}
