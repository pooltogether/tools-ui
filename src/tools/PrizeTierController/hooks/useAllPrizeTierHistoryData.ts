import { usePrizePools } from '@hooks/usePrizePools'
import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { useQueries } from 'react-query'
import { getQueryKey, getQueryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'

export const useAllPrizeTierHistoryData = () => {
  const prizePools = usePrizePools()
  const allPrizeTierHistoryData: {
    [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfig }
  } = {}
  const queries = prizePools.map((prizePool) => {
    return {
      queryKey: getQueryKey(prizePool),
      queryFn: () => getQueryData(prizePool)
    }
  })
  const results = useQueries(queries)
  const isFetched = results.every((result) => result.isFetched)
  if (isFetched) {
    prizePools.forEach((prizePool, i) => {
      const prizeTier = results[i].data
      if (allPrizeTierHistoryData[prizePool.chainId] === undefined) {
        allPrizeTierHistoryData[prizePool.chainId] = {}
      }
      allPrizeTierHistoryData[prizePool.chainId][prizePool.prizeTierHistoryMetadata.address] = {
        bitRangeSize: prizeTier.bitRangeSize,
        expiryDuration: prizeTier.expiryDuration,
        maxPicksPerUser: prizeTier.maxPicksPerUser,
        prize: prizeTier.prize,
        tiers: prizeTier.tiers,
        endTimestampOffset: prizeTier.endTimestampOffset
      }
    })
  }
  return { data: allPrizeTierHistoryData, isFetched }
}
