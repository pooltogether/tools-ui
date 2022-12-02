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
  const newestDrawId: number = (
    await prizeTierHistoryContract.contract.functions.getNewestDrawId()
  )[0]
  const result = (await prizeTierHistoryContract.contract.functions.getPrizeTier(newestDrawId))[0]
  if (prizeTierHistoryContract.isV2) {
    const prizeTierV2: PrizeTierV2 = {
      bitRangeSize: result[0].bitRangeSize,
      expiryDuration: result[0].expiryDuration,
      maxPicksPerUser: result[0].maxPicksPerUser,
      prize: result[0].prize,
      tiers: result[0].tiers,
      endTimestampOffset: result[0].endTimestampOffset,
      drawId: result[0].drawId,
      dpr: result[0].dpr
    }
    return prizeTierV2
  } else {
    const prizeTier: PrizeTierV2 = {
      bitRangeSize: result[0].bitRangeSize,
      expiryDuration: result[0].expiryDuration,
      maxPicksPerUser: result[0].maxPicksPerUser,
      prize: result[0].prize,
      tiers: result[0].tiers,
      endTimestampOffset: result[0].endTimestampOffset,
      drawId: result[0].drawId
    }
    return prizeTier
  }
}
