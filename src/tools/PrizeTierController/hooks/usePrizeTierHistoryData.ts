import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryData = (prizePool: PrizePool) => {
  return useQuery(getQueryKey(prizePool), () => getQueryData(prizePool), {
    enabled: !!prizePool
  })
}

export const getQueryKey = (prizePool: PrizePool) => {
  return ['usePrizeTierHistoryData', prizePool.id()]
}

export const getQueryData = async (prizePool: PrizePool) => {
  const upcomingPrizeTier = await prizePool.getUpcomingPrizeTier()
  return upcomingPrizeTier
}
