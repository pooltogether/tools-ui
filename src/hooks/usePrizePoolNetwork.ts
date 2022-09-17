import { getContractListChainIds, PrizePoolNetwork } from '@pooltogether/v4-client-js'
import { useReadProviders } from '@pooltogether/wallet-connection'
import { useMemo } from 'react'
import { useContractList } from './useContractList'


export const usePrizePoolNetwork = (): PrizePoolNetwork => {
  const prizePoolNetworkContractList = useContractList()
  const chainIds = getContractListChainIds(prizePoolNetworkContractList.contracts)
  const readProviders = useReadProviders(chainIds)

  return useMemo(() => {
    return new PrizePoolNetwork(readProviders, prizePoolNetworkContractList)
  }, [prizePoolNetworkContractList])
}
