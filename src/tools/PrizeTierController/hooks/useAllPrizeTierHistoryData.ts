import { usePrizePools } from '@hooks/usePrizePools'
import { usePrizeTierHistoryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { PrizeTierConfig } from '@pooltogether/v4-utils-js'

export const useAllPrizeTierHistoryData = () => {
  const prizePools = usePrizePools()
  const allPrizeTierHistoryData: {
    [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfig }
  } = {}
  let allFetched = true
  prizePools.forEach((prizePool) => {
    const { data, isFetched } = usePrizeTierHistoryData(prizePool)
    if (isFetched) {
      if (allPrizeTierHistoryData[prizePool.chainId] === undefined) {
        allPrizeTierHistoryData[prizePool.chainId] = {}
      }
      allPrizeTierHistoryData[prizePool.chainId][prizePool.prizeTierHistoryMetadata.address] = {
        bitRangeSize: data.upcomingPrizeTier.bitRangeSize,
        expiryDuration: data.upcomingPrizeTier.expiryDuration,
        maxPicksPerUser: data.upcomingPrizeTier.maxPicksPerUser,
        prize: data.upcomingPrizeTier.prize,
        tiers: data.upcomingPrizeTier.tiers,
        endTimestampOffset: data.upcomingPrizeTier.endTimestampOffset
      }
    } else {
      allFetched = false
    }
  })
  return { data: allPrizeTierHistoryData, isFetched: allFetched }
}
