import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryData = (prizePool: PrizePool) => {
  return useQuery(
    ['usePrizeTierHistoryData', prizePool?.id()],
    async () => {
      const upcomingPrizeTier = await prizePool.getUpcomingPrizeTier()

      return {
        upcomingPrizeTier
      }
    },
    {
      enabled: !!prizePool
    }
  )
}
