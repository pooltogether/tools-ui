import { getChainIdByAlias, getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { PrizeTierConfig } from '@pooltogether/v4-utils-js'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import { getUrlQueryParam } from '@utils/getUrlQueryParam'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { QUERY_PARAM } from './constants'
import { getDefaultPrizeTierControllerChainId } from './utils/getDefaultPrizeTierControllerChainId'
import { getPrizeTierControllerSupportedChainIds } from './utils/getPrizeTierControllerSupportedChainIds'

/**
 * Tries to get the chain id from a query param, otherwise returns the default
 * @returns
 */
const getStartingPrizeTierControllerChainId = () => {
  const defaultChainId = getDefaultPrizeTierControllerChainId()
  const chainAlias = getUrlQueryParam(QUERY_PARAM.prizeTierControllerChain)
  if (!chainAlias) return defaultChainId
  const queryParamChainId = getChainIdByAlias(chainAlias)
  const supportedChainIds = getPrizeTierControllerSupportedChainIds()
  if (supportedChainIds.includes(queryParamChainId)) return queryParamChainId
  return defaultChainId
}

/**
 * The chain id to use for the delegation view.
 * TODO: Eventually we'll need to update this to a specific deployment when there are more than 1 on a chain.
 */
export const prizeTierControllerChainIdAtom = atom<number>(CHAIN_ID.mainnet)
prizeTierControllerChainIdAtom.onMount = (setAtom) =>
  setAtom(getStartingPrizeTierControllerChainId())

/**
 * Write-only
 */
export const setPrizeTierControllerChainAtom = atom<null, number>(null, (get, set, chainId) => {
  if (!chainId) {
    set(prizeTierControllerChainIdAtom, undefined)
    return
  }
  const chainName = getNetworkNameAliasByChainId(chainId)
  const url = new URL(window.location.href)
  url.searchParams.set(QUERY_PARAM.prizeTierControllerChain, chainName)
  window.history.pushState(null, '', url)
  set(prizeTierControllerChainIdAtom, chainId)
})

export enum EditPrizeTierModalState {
  'all' = 'all',
  'singular' = 'singular'
}

export const isEditPrizeTiersModalOpenAtom = atom(false)
export const selectedPrizePoolIdAtom = atom<string>('')
export const selectedPrizeTierHistoryAddressAtom = atom<string>('')
export const selectedPrizeTierHistoryChainIdAtom = atom<number>(-1)
export const editPrizeTierModalStateAtom = atom<EditPrizeTierModalState>(
  EditPrizeTierModalState.all
)
export const prizeTierEditsAtom = atomWithReset<{
  [chainId: number]: { [prizeTierHistoryAddress: string]: Partial<PrizeTierConfig> }
}>({})
