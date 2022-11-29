import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryOwner = (prizePool: PrizePool) => {
  return useQuery(['usePrizeTierHistoryOwner', prizePool?.id()], async () => {
    const owner: string = await prizePool.prizeTierHistoryContract.functions.owner()

    return owner
  })
}
