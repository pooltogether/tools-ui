import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { usePrizeTierHistoryContracts } from '@prizeTierController/hooks/usePrizeTierHistoryContracts'
import {
  getQueryKey,
  getQueryData,
  getQueryDataV2
} from '@prizeTierController/hooks/usePrizeTierHistoryData'
import { PrizeTierConfigV2 } from '@prizeTierController/interfaces'
import { useQueries } from 'react-query'

export const useAllPrizeTierHistoryData = () => {
  const prizeTierHistoryContracts = usePrizeTierHistoryContracts()
  const allPrizeTierHistoryData: {
    [chainId: number]: { [prizeTierHistoryAddress: string]: PrizeTierConfig | PrizeTierConfigV2 }
  } = {}

  // V1 Queries:
  const contracts = prizeTierHistoryContracts.filter((contract) => !contract.isV2)
  const queries = contracts.map((contract) => {
    return {
      queryKey: getQueryKey(contract),
      queryFn: () => getQueryData(contract)
    }
  })
  const results = useQueries(queries)
  const isFetched = results.every((result) => result.isFetched)
  if (isFetched) {
    contracts.forEach((contract, i) => {
      const prizeTier = results[i].data
      if (allPrizeTierHistoryData[contract.chainId] === undefined) {
        allPrizeTierHistoryData[contract.chainId] = {}
      }
      allPrizeTierHistoryData[contract.chainId][contract.address] = {
        bitRangeSize: prizeTier.bitRangeSize,
        expiryDuration: prizeTier.expiryDuration,
        maxPicksPerUser: prizeTier.maxPicksPerUser,
        prize: prizeTier.prize,
        tiers: prizeTier.tiers,
        endTimestampOffset: prizeTier.endTimestampOffset
      }
    })
  }

  // V2 Queries:
  const contractsV2 = prizeTierHistoryContracts.filter((contract) => contract.isV2)
  const queriesV2 = contractsV2.map((contract) => {
    return {
      queryKey: getQueryKey(contract),
      queryFn: () => getQueryDataV2(contract)
    }
  })
  const resultsV2 = useQueries(queriesV2)
  const isFetchedV2 = resultsV2.every((result) => result.isFetched)
  if (isFetchedV2) {
    contractsV2.forEach((contract, i) => {
      const prizeTierV2 = resultsV2[i].data
      if (allPrizeTierHistoryData[contract.chainId] === undefined) {
        allPrizeTierHistoryData[contract.chainId] = {}
      }
      allPrizeTierHistoryData[contract.chainId][contract.address] = {
        bitRangeSize: prizeTierV2.bitRangeSize,
        expiryDuration: prizeTierV2.expiryDuration,
        maxPicksPerUser: prizeTierV2.maxPicksPerUser,
        prize: prizeTierV2.prize,
        tiers: prizeTierV2.tiers,
        endTimestampOffset: prizeTierV2.endTimestampOffset,
        dpr: prizeTierV2.dpr
      }
    })
  }

  return { data: allPrizeTierHistoryData, isFetched: isFetched && isFetchedV2 }
}
