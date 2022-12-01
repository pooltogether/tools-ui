import { PrizeTier, PrizeTierV2 } from '@pooltogether/v4-utils-js'
import { PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryData = (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  return useQuery(getQueryKey(prizeTierHistoryContract), () =>
    getQueryData(prizeTierHistoryContract)
  )
}

export const usePrizeTierHistoryDataV2 = (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  return useQuery(getQueryKey(prizeTierHistoryContract), () =>
    getQueryDataV2(prizeTierHistoryContract)
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

export const getQueryDataV2 = async (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  const newestDrawId: number = (
    await prizeTierHistoryContract.contract.functions.getNewestDrawId()
  )[0]
  const result = (await prizeTierHistoryContract.contract.functions.getPrizeTier(newestDrawId))[0]
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
}
