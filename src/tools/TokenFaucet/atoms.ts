import { getChainIdByAlias, getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { getUrlQueryParam } from '@utils/getUrlQueryParam'
import { atom } from 'jotai'
import { QUERY_PARAM } from './constants'
import { getDefaultTokenFaucetChainId } from './utils/getDefaultTokenFaucetChainId'
import { getTokenFaucetSupportedChainIds } from './utils/getTokenFaucetSupportedChainIds'

/**
 * Tries to get the chain id from a query param, otherwise returns the default
 * @returns
 */
const getStartingTokenFaucetChainId = () => {
  const defaultChainId = getDefaultTokenFaucetChainId()
  const tokenFaucetChainAlias = getUrlQueryParam(QUERY_PARAM.tokenFaucetChain)
  if (!tokenFaucetChainAlias) return defaultChainId
  const queryParamChainId = getChainIdByAlias(tokenFaucetChainAlias)
  const supportedChainIds = getTokenFaucetSupportedChainIds()
  if (supportedChainIds.includes(queryParamChainId)) return queryParamChainId
  return defaultChainId
}

/**
 * The chain id to use for the tokenFaucet view.
 * TODO: Eventually we'll need to update this to a specific deployment when there are more than 1 on a chain.
 */
export const tokenFaucetChainIdAtom = atom<number>(getStartingTokenFaucetChainId())

/**
 * The default token faucet address to use for the tokenFaucet view.
 */
export const tokenFaucetAddressAtom = atom<string>('')

/**
 * Write-only
 */
export const setTokenFaucetChainAtom = atom<null, number>(null, (get, set, chainId) => {
  if (!chainId) {
    set(tokenFaucetChainIdAtom, undefined)
    return
  }
  const chainName = getNetworkNameAliasByChainId(chainId)
  const url = new URL(window.location.href)
  url.searchParams.set(QUERY_PARAM.tokenFaucetChain, chainName)
  window.history.pushState(null, '', url)
  set(tokenFaucetChainIdAtom, chainId)
})

///////////////////////////// Modals /////////////////////////////

/**
 *
 */
export const claimTokenFaucetModalOpenAtom = atom<boolean>(false)
