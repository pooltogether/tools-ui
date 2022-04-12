import { getChainIdByAlias, getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { PromotionId, PromotionUpdate } from '@twabRewards/interfaces'
import { getUrlQueryParam } from '@utils/getUrlQueryParam'
import { BigNumber } from 'ethers'
import { getAddress, isAddress } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
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
export const currentAccountAtom = atom<string>(getStartingAccount())

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
export const rewardsChainIdAtom = atom<number>(getStartingRewardsChainId())

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

/**
 *
 */
// export const promotionCreationsAtom = atomWithReset<PromotionUpdate[]>([])

/**
 *
 */
// export const promotionUpdatesAtom = atomWithReset<PromotionUpdate[]>([])

// /**
//  *
//  */
// export const promotionFundsAtom = atomWithReset<PromotionFund[]>([])

// /**
//  *
//  */
// export const promotionWithdrawalsAtom = atomWithReset<PromotionFund[]>([])

/**
 * Read-only
 */
// export const promotionCreationsCountAtom = atom<number>((get) => {
//   const promotionCreations = get(promotionCreationsAtom)
//   return promotionCreations.length
// })

/**
 * Read-only
 */
// export const promotionUpdatesCountAtom = atom<number>((get) => {
//   const promotionUpdates = get(promotionUpdatesAtom)
//   return promotionUpdates.length
// })

/**
 * Read-only
 */
// export const promotionUpdatedLocksCountAtom = atom<number>((get) => {
//   const promotionUpdates = get(promotionUpdatesAtom)
//   const promotionCreations = get(promotionCreationsAtom)
//   const updateLocks = promotionUpdates.reduce(
//     (count, promotionUpdate) => (promotionUpdate.lockDuration ? count + 1 : count),
//     0
//   )

//   const creationLocks = promotionCreations.reduce(
//     (count, promotionCreation) => (promotionCreation.lockDuration ? count + 1 : count),
//     0
//   )

//   return updateLocks + creationLocks
// })

/**
 * Read-only
 */
// export const promotionWithdrawlsCountAtom = atom<number>((get) => {
//   const promotionFunds = get(promotionWithdrawalsAtom)
//   return promotionFunds.length
// })

/**
 * Read-only
 */
// export const promotionFundsCountAtom = atom<number>((get) => {
//   const promotionFunds = get(promotionFundsAtom)
//   return promotionFunds.length
// })

/**
 * Write-only
 */
// export const addPromotionCreationAtom = atom<null, PromotionUpdate>(
//   null,
//   (get, set, promotionUpdate) => {
//     const promotionCreations = [...get(promotionCreationsAtom)]

//     const index = findPromotionUpdateIndex(promotionUpdate, promotionCreations)
//     if (index !== -1) {
//       promotionCreations[index] = promotionUpdate
//     } else {
//       promotionCreations.push(promotionUpdate)
//     }
//     set(promotionCreationsAtom, promotionCreations)
//   }
// )

/**
 * Write-only
 */
// export const removePromotionCreationAtom = atom<null, PromotionId>(
//   null,
//   (get, set, promotionId) => {
//     const _promotionCreations = get(promotionCreationsAtom)
//     const promotionCreations = _promotionCreations.filter(
//       (_promotionUpdate) =>
//         _promotionUpdate.delegator !== promotionId.delegator ||
//         !_promotionUpdate.slot.eq(promotionId.slot)
//     )
//     set(promotionCreationsAtom, promotionCreations)
//   }
// )

/**
 * Write-only
 */
// export const addPromotionUpdateAtom = atom<null, PromotionUpdate>(
//   null,
//   (get, set, promotionUpdate) => {
//     const promotionUpdates = [...get(promotionUpdatesAtom)]

//     const index = findPromotionUpdateIndex(promotionUpdate, promotionUpdates)
//     if (index !== -1) {
//       promotionUpdates[index] = promotionUpdate
//     } else {
//       promotionUpdates.push(promotionUpdate)
//     }
//     set(promotionUpdatesAtom, promotionUpdates)
//   }
// )

/**
 * Write-only
 */
// export const removePromotionUpdateAtom = atom<null, PromotionId>(null, (get, set, promotionId) => {
//   const _promotionUpdates = get(promotionUpdatesAtom)
//   const promotionUpdates = _promotionUpdates.filter(
//     (_promotionUpdate) =>
//       _promotionUpdate.delegator !== promotionId.delegator ||
//       !_promotionUpdate.slot.eq(promotionId.slot)
//   )
//   set(promotionUpdatesAtom, promotionUpdates)
// })

/**
 * Write-only
 * Queues up an update to fund a promotion
 */
// export const addPromotionFundAtom = atom<null, PromotionFund>(null, (get, set, promotionFund) => {
//   const promotionFunds = [...get(promotionFundsAtom)]
//   const index = findPromotionUpdateIndex(promotionFund, promotionFunds)
//   if (index !== -1) {
//     promotionFunds[index] = promotionFund
//   } else {
//     promotionFunds.push(promotionFund)
//   }
//   set(promotionFundsAtom, promotionFunds)
// })

/**
 * Write-only
 * Removes the fund queued for an update
 */
// export const removePromotionFundAtom = atom<null, PromotionId>(null, (get, set, promotionId) => {
//   const _promotionFunds = [...get(promotionFundsAtom)]
//   const promotionFunds = _promotionFunds.filter(
//     (_promotionFund) =>
//       _promotionFund.delegator !== promotionId.delegator ||
//       !_promotionFund.slot.eq(promotionId.slot)
//   )
//   set(promotionFundsAtom, promotionFunds)
// })

/**
 * Write-only
 * Queues up an update to set the balance of a promotion to 0
 */
// export const addPromotionWithdrawalAtom = atom<null, PromotionId>(null, (get, set, promotionId) => {
//   const promotionFunds = [...get(promotionWithdrawalsAtom)]
//   const index = findPromotionUpdateIndex(promotionId, promotionFunds)
//   const promotionFund: PromotionFund = { ...promotionId, amount: BigNumber.from(0) }
//   if (index !== -1) {
//     promotionFunds[index] = promotionFund
//   } else {
//     promotionFunds.push(promotionFund)
//   }
//   set(promotionWithdrawalsAtom, promotionFunds)
// })

/**
 * Write-only
 * Removes the withdrawal queued for an update
 */
// export const removePromotionWithdrawalAtom = atom<null, PromotionId>(
//   null,
//   (get, set, promotionId) => {
//     const _promotionFunds = [...get(promotionWithdrawalsAtom)]
//     const promotionFunds = _promotionFunds.filter(
//       (_promotionFund) =>
//         _promotionFund.delegator !== promotionId.delegator ||
//         !_promotionFund.slot.eq(promotionId.slot)
//     )
//     set(promotionWithdrawalsAtom, promotionFunds)
//   }
// )

///////////////////////////Modals /////////////////////////////

/**
 *
 */
export const editPromotionModalOpenAtom = atom<boolean>(false)

/**
 *
 */
export const createPromotionModalOpenAtom = atom<boolean>(false)

/**
 *
 */
export const promotionUpdatesModalOpenAtom = atom<boolean>(false)

/**
 *
 */
export const promotionIdToEditAtom = atom<PromotionId>(undefined as PromotionId)

///////////////////////////Helpers /////////////////////////////

// /**
//  *
//  * @param promotionId
//  * @param promotions
//  * @returns
//  */
// const findPromotionUpdateIndex = (promotionId: PromotionId, promotions: PromotionId[]) =>
//   promotions.findIndex(
//     (promotions) =>
//       promotions.slot.eq(promotionId.slot) && promotions.delegator === promotionId.delegator
//   )
