import { Token } from '@pooltogether/hooks'
import { getChainIdByAlias } from '@pooltogether/utilities'
import { getUrlQueryParam } from '@utils/getUrlQueryParam'
import { atom } from 'jotai'
import { getDefaultLiquidatorChainId } from '@liquidator/utils/getDefaultLiquidatorChainId'
import { getLiquidatorSupportedChainIds } from '@liquidator/utils/getLiquidatorSupportedChainIds'
import { CHAIN_ID } from '@constants/misc'
import { FAUCET_DEFAULT_CHAIN_ID } from './config'
import { getDefaultTestnetFaucetChainId } from './utils/getDefaultTestnetFaucetChainId'
import { QUERY_PARAM } from './constants'

/**
 * Tries to get the chain id from a query param, otherwise returns the default
 * @returns
 */
const getStartingTestnetFaucetChainId = () => {
  const defaultChainId = getDefaultTestnetFaucetChainId()
  const delegationChainAlias = getUrlQueryParam(QUERY_PARAM.faucetChain)
  if (!delegationChainAlias) return defaultChainId
  const queryParamChainId = getChainIdByAlias(delegationChainAlias)
  const supportedChainIds = getLiquidatorSupportedChainIds()
  if (supportedChainIds.includes(queryParamChainId)) return queryParamChainId
  return defaultChainId
}

/**
 * The chain id to use for the testnet token faucet view.
 */
export const testnetFaucetChainIdAtom = atom<number>(getStartingTestnetFaucetChainId())
