import { getChainIdByAlias, getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import { getUrlQueryParam } from '@utils/getUrlQueryParam'
import { getAddress, isAddress } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { QUERY_PARAM } from './constants'
import { getDefaultRewardsChainId } from './utils/getDefaultRewardsChainId'
import { getRewardsSupportedChainIds } from './utils/getRewardsSupportedChainIds'

/**
 * The starting address for the rewards view.
 */
const getStartingAccount = () => {
  const account = getUrlQueryParam(QUERY_PARAM.account, null, null, [(v) => isAddress(v)])
  return account ? getAddress(account) : null
}

/**
 * The address to use as the delegator for the rewards view
 */
export const currentAccountAtom = atom<string>('')
currentAccountAtom.onMount = (setAtom) => setAtom(getStartingAccount())

/**
 * Write-only
 */
export const setCurrentAccountAtom = atom<null, string>(null, (get, set, _currentAccount) => {
  if (!_currentAccount) {
    set(currentAccountAtom, null)
    return
  }
  const currentAccount = getAddress(_currentAccount)
  const url = new URL(window.location.href)
  url.searchParams.set(QUERY_PARAM.account, currentAccount)
  window.history.pushState(null, '', url)
  set(currentAccountAtom, currentAccount)
})

/**
 * Tries to get the chain id from a query param, otherwise returns the default
 * @returns
 */
const getStartingRewardsChainId = () => {
  const defaultChainId = getDefaultRewardsChainId()
  const rewardsChainAlias = getUrlQueryParam(QUERY_PARAM.rewardsChain)
  if (!rewardsChainAlias) return defaultChainId
  const queryParamChainId = getChainIdByAlias(rewardsChainAlias)
  const supportedChainIds = getRewardsSupportedChainIds()
  if (supportedChainIds.includes(queryParamChainId)) return queryParamChainId
  return defaultChainId
}

/**
 * The chain id to use for the rewards view.
 * Eventually we'll need to update this to a specific deployment when there are more than 1 on a chain.
 */
export const rewardsChainIdAtom = atom<number>(CHAIN_ID.mainnet)
rewardsChainIdAtom.onMount = (setAtom) => setAtom(getStartingRewardsChainId())

/**
 * Write-only
 */
export const setRewardsChainAtom = atom<null, number>(null, (get, set, chainId) => {
  if (!chainId) {
    set(rewardsChainIdAtom, undefined)
    return
  }
  const chainName = getNetworkNameAliasByChainId(chainId)
  const url = new URL(window.location.href)
  url.searchParams.set(QUERY_PARAM.rewardsChain, chainName)
  window.history.pushState(null, '', url)
  set(rewardsChainIdAtom, chainId)
})

/////////////////////////// Modals /////////////////////////////

/**
 *
 */
export const createPromotionModalOpenAtom = atom<boolean>(false)
