import { useMemo } from 'react'
import { getContractListChainIds, PrizePoolNetwork } from '@pooltogether/v4-client-js'

import { useContractList } from './useContractList'
import { useReadProviders } from '@hooks/app/useReadProviders'

export const usePrizePoolNetwork = (): PrizePoolNetwork => {
  const prizePoolNetworkContractList = useContractList()
  const chainIds = getContractListChainIds(prizePoolNetworkContractList.contracts)
  const readProviders = useReadProviders(chainIds)

  return useMemo(() => {
    return new PrizePoolNetwork(readProviders, prizePoolNetworkContractList)
  }, [prizePoolNetworkContractList])
}
