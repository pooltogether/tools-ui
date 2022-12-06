import { usePrizeTierHistoryContracts } from '@prizeTierController/hooks/usePrizeTierHistoryContracts'
import { getQueryKey, getQueryData } from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { PrizeTierConfigV2 } from '@prizeTierController/interfaces'
import { useQueries } from 'react-query'

export const useAllPrizeTierHistoryData = () => {
  const prizeTierHistoryContracts = usePrizeTierHistoryContracts()
  const allPrizeTierHistoryData: {
    [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfigV2 }
  } = {}

  const queries = prizeTierHistoryContracts.map((contract) => {
    return {
      queryKey: getQueryKey(contract),
      queryFn: () => getQueryData(contract)
    }
  })
  const results = useQueries(queries)
  const isFetched = results.every((result) => result.isFetched)
  if (isFetched) {
    prizeTierHistoryContracts.forEach((contract, i) => {
      const prizeTier = results[i].data
      if (!!prizeTier) {
        if (allPrizeTierHistoryData[contract.chainId] === undefined) {
          allPrizeTierHistoryData[contract.chainId] = {}
        }
        if (contract.isV2) {
          allPrizeTierHistoryData[contract.chainId][contract.address] = {
            bitRangeSize: prizeTier.bitRangeSize,
            expiryDuration: prizeTier.expiryDuration,
            maxPicksPerUser: prizeTier.maxPicksPerUser,
            prize: prizeTier.prize,
            tiers: prizeTier.tiers,
            endTimestampOffset: prizeTier.endTimestampOffset,
            dpr: prizeTier.dpr
          }
        } else {
          allPrizeTierHistoryData[contract.chainId][contract.address] = {
            bitRangeSize: prizeTier.bitRangeSize,
            expiryDuration: prizeTier.expiryDuration,
            maxPicksPerUser: prizeTier.maxPicksPerUser,
            prize: prizeTier.prize,
            tiers: prizeTier.tiers,
            endTimestampOffset: prizeTier.endTimestampOffset
          }
        }
      }
    })
  }

  return { data: allPrizeTierHistoryData, isFetched }
}
