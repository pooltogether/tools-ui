import { QUERY_PARAM, SlippageAmounts, SlippageSetting, SwapState } from '@liquidator/constants'
import { getDefaultLiquidatorChainId } from '@liquidator/utils/getDefaultLiquidatorChainId'
import { getLiquidatorSupportedChainIds } from '@liquidator/utils/getLiquidatorSupportedChainIds'
import { Token } from '@pooltogether/hooks'
import { getChainIdByAlias } from '@pooltogether/utilities'
import { getUrlQueryParam } from '@utils/getUrlQueryParam'
import { atom } from 'jotai'

/**
 * Tries to get the chain id from a query param, otherwise returns the default
 * @returns
 */
const getStartingLiquidatorChainId = () => {
  const defaultChainId = getDefaultLiquidatorChainId()
  const delegationChainAlias = getUrlQueryParam(QUERY_PARAM.liquidatorChain)
  if (!delegationChainAlias) return defaultChainId
  const queryParamChainId = getChainIdByAlias(delegationChainAlias)
  const supportedChainIds = getLiquidatorSupportedChainIds()
  if (supportedChainIds.includes(queryParamChainId)) return queryParamChainId
  return defaultChainId
}

/**
 * The chain id to use for the liquidator view.
 */
export const liquidatorChainIdAtom = atom<number>(0)
liquidatorChainIdAtom.onMount = (setAtom) => setAtom(getStartingLiquidatorChainId())

/**
 * The slippage setting that determines the slippage amount in the price of the token.
 */
export const slippageSettingAtom = atom<SlippageSetting>(SlippageSetting.low)

/**
 * The amount of slippage in the price of a token.
 */
export const slippagePercentAtom = atom<number>(SlippageAmounts[SlippageSetting.low])

/**
 * The token a user wishes to swap.
 */
export const swapInStateAtom = atom<SwapState>(SwapState.prize)

/**
 * The token a user wishes to swap for.
 */
export const swapOutStateAtom = atom<SwapState>((read) => {
  const swapInState = read(swapInStateAtom)
  if (swapInState === SwapState.prize) return SwapState.ticket
  return SwapState.prize
})

/**
 * The ticket token a user wishes to swap.
 */
export const ticketTokenAtom = atom<Token>(undefined as Token)
