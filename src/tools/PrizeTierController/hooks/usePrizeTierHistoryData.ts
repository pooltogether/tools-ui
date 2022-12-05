import { PrizeTier } from '@pooltogether/v4-utils-js'
import { PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { Result } from 'ethers/lib/utils'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryData = (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  return useQuery(
    getQueryKey(prizeTierHistoryContract),
    () => getQueryData(prizeTierHistoryContract),
    {
      enabled: !!prizeTierHistoryContract
    }
  )
}

export const getQueryKey = (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  return ['usePrizeTierHistoryData', prizeTierHistoryContract.id]
}

export const getQueryData = async (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  const newestDrawId: number = (
    await prizeTierHistoryContract.contract.functions.getNewestDrawId()
  )[0]
  const result: Result = await prizeTierHistoryContract.contract.functions.getPrizeTier(
    newestDrawId
  )
  const prizeTier: PrizeTier = {
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
