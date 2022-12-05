import { APP_ENVIRONMENTS, useIsTestnets } from '@pooltogether/hooks'
import { useReadProviders } from '@pooltogether/wallet-connection'
import prizeTierHistoryABI from '@prizeTierController/abis/PrizeTierHistory'
import {
  PRIZE_TIER_CONTROLLER_SUPPORTED_CHAIN_IDS,
  PRIZE_TIER_HISTORY_V1,
  PRIZE_TIER_HISTORY_TOKENS
} from '@prizeTierController/config'
import { PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { ethers } from 'ethers'

export const usePrizeTierHistoryContracts = () => {
  const { isTestnets } = useIsTestnets()
  const chainIds = getChainIds({ testnets: isTestnets })
  const readProviders = useReadProviders(chainIds)

  const prizeTierHistoryContracts: PrizeTierHistoryContract[] = chainIds.map((chainId) => {
    const contractInfo = PRIZE_TIER_HISTORY_V1[chainId]
    const token = PRIZE_TIER_HISTORY_TOKENS[chainId][contractInfo.tokenAddress]
    if (contractInfo && token) {
      const address = contractInfo.address
      const id = `${address}-${chainId}`
      const contract = new ethers.Contract(address, prizeTierHistoryABI, readProviders[chainId])
      return { id, chainId, address, token, contract }
    }
  })

  return prizeTierHistoryContracts
}

const getChainIds = (options?: { testnets?: boolean }) => {
  if (!options?.testnets) {
    return PRIZE_TIER_CONTROLLER_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
  } else {
    return PRIZE_TIER_CONTROLLER_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
  }
}
