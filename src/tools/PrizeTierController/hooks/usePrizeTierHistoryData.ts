import { PrizeTierHistoryContract, PrizeTierV2 } from '@prizeTierController/interfaces'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryData = (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  return useQuery(getQueryKey(prizeTierHistoryContract), () =>
    getQueryData(prizeTierHistoryContract)
  )
}

export const getQueryKey = (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  return ['usePrizeTierHistoryData', prizeTierHistoryContract.id]
}

export const getQueryData = async (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  try {
    const newestDrawId: number = (
      await prizeTierHistoryContract.contract.functions.getNewestDrawId()
    )[0]
    const result = (await prizeTierHistoryContract.contract.functions.getPrizeTier(newestDrawId))[0]
    if (prizeTierHistoryContract.isV2) {
      const prizeTierV2: PrizeTierV2 = {
        bitRangeSize: result.bitRangeSize,
        expiryDuration: result.expiryDuration,
        maxPicksPerUser: result.maxPicksPerUser,
        prize: result.prize,
        tiers: result.tiers,
        endTimestampOffset: result.endTimestampOffset,
        drawId: result.drawId,
        dpr: result.dpr
      }
      return prizeTierV2
    } else {
      const prizeTier: PrizeTierV2 = {
        bitRangeSize: result.bitRangeSize,
        expiryDuration: result.expiryDuration,
        maxPicksPerUser: result.maxPicksPerUser,
        prize: result.prize,
        tiers: result.tiers,
        endTimestampOffset: result.endTimestampOffset,
        drawId: result.drawId
      }
      return prizeTier
    }
  } catch {}
}
