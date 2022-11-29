import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryNewestDrawId = (prizePool: PrizePool) => {
  return useQuery(['usePrizeTierHistoryNewestDrawId', prizePool?.id()], async () => {
    const newestDrawId: number =
      await prizePool.prizeTierHistoryContract.functions.getNewestDrawId()

    return {
      newestDrawId
    }
  })
}
