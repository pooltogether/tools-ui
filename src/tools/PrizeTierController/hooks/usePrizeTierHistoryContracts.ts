import { APP_ENVIRONMENTS, Token, useIsTestnets } from '@pooltogether/hooks'
import { useReadProviders } from '@pooltogether/wallet-connection'
import prizeTierHistoryABI from '@prizeTierController/abis/PrizeTierHistory'
import prizeTierHistoryV2ABI from '@prizeTierController/abis/PrizeTierHistoryV2'
import {
  PRIZE_TIER_CONTROLLER_SUPPORTED_CHAIN_IDS,
  PRIZE_TIER_HISTORY_V1,
  PRIZE_TIER_HISTORY_V2,
  PRIZE_TIER_HISTORY_TOKENS
} from '@prizeTierController/config'
import { PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { ethers } from 'ethers'

export const usePrizeTierHistoryContracts = () => {
  const { isTestnets } = useIsTestnets()
  const chainIds = getChainIds({ testnets: isTestnets })
  const readProviders = useReadProviders(chainIds)

  const prizeTierHistoryContracts: PrizeTierHistoryContract[] = []

  chainIds.forEach((chainId) => {
    const tokens = PRIZE_TIER_HISTORY_TOKENS[chainId]
    const provider = readProviders[chainId]

    // V1 Prize Tier History Contracts:
    const contractInfo = PRIZE_TIER_HISTORY_V1[chainId]
    const token = tokens[contractInfo.tokenAddress]
    if (contractInfo && token && contractInfo.address !== '') {
      prizeTierHistoryContracts.push(
        formatPrizeTierHistoryContract(chainId, contractInfo.address, token, provider)
      )
    }

    // V2 Prize Tier History Contracts:
    const contractInfoV2 = PRIZE_TIER_HISTORY_V2[chainId]
    const tokenV2 = tokens[contractInfoV2.tokenAddress]
    if (contractInfoV2 && tokenV2 && contractInfoV2.address !== '') {
      prizeTierHistoryContracts.push(
        formatPrizeTierHistoryContract(chainId, contractInfoV2.address, tokenV2, provider, {
          isV2: true
        })
      )
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

const formatPrizeTierHistoryContract = (
  chainId: number,
  address: string,
  token: Token,
  provider: ethers.providers.BaseProvider,
  options?: { isV2?: boolean }
): PrizeTierHistoryContract => {
  const id = `${address}-${chainId}`
  const isV2 = options?.isV2
  const ABI = isV2 ? prizeTierHistoryV2ABI : prizeTierHistoryABI
  const contract = new ethers.Contract(address, ABI, provider)
  return { id, chainId, address, token, contract, isV2 }
}
