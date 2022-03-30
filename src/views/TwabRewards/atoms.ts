import { getChainIdByAlias, getNetworkNameAliasByChainId } from '@pooltogether/utilities'
// import {
//   RewardsFormValues,
//   RewardsFund,
//   RewardsId,
//   RewardsUpdate
// } from '@twabDelegator/interfaces'
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
const getStartingAddress = () => {
  const address = getUrlQueryParam(QUERY_PARAM.address, null, null, [(v) => isAddress(v)])
  return address ? getAddress(address) : null
}

/**
 * The address to use as the delegator for the rewards view
 */
export const addressAtom = atom<string>(getStartingAddress())

/**
 * Write-only
 */
export const setAddressAtom = atom<null, string>(null, (get, set, _address) => {
  if (!_address) {
    set(addressAtom, null)
    return
  }
  const address = getAddress(_address)
  const url = new URL(window.location.href)
  url.searchParams.set(QUERY_PARAM.address, address)
  window.history.pushState(null, '', url)
  set(addressAtom, address)
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

// /**
//  *
//  */
// export const rewardsCreationsAtom = atomWithReset<RewardsUpdate[]>([])

// /**
//  *
//  */
// export const rewardsUpdatesAtom = atomWithReset<RewardsUpdate[]>([])

// /**
//  *
//  */
// export const rewardsFundsAtom = atomWithReset<RewardsFund[]>([])

// /**
//  *
//  */
// export const rewardsWithdrawalsAtom = atomWithReset<RewardsFund[]>([])

// /**
//  * Read-only
//  */
// export const rewardsCreationsCountAtom = atom<number>((get) => {
//   const rewardsCreations = get(rewardsCreationsAtom)
//   return rewardsCreations.length
// })

// /**
//  * Read-only
//  */
// export const rewardsUpdatesCountAtom = atom<number>((get) => {
//   const rewardsUpdates = get(rewardsUpdatesAtom)
//   return rewardsUpdates.length
// })

// /**
//  * Read-only
//  */
// export const rewardsUpdatedLocksCountAtom = atom<number>((get) => {
//   const rewardsUpdates = get(rewardsUpdatesAtom)
//   const rewardsCreations = get(rewardsCreationsAtom)
//   const updateLocks = rewardsUpdates.reduce(
//     (count, rewardsUpdate) => (rewardsUpdate.lockDuration ? count + 1 : count),
//     0
//   )

//   const creationLocks = rewardsCreations.reduce(
//     (count, rewardsCreation) => (rewardsCreation.lockDuration ? count + 1 : count),
//     0
//   )

//   return updateLocks + creationLocks
// })

// /**
//  * Read-only
//  */
// export const rewardsWithdrawlsCountAtom = atom<number>((get) => {
//   const rewardsFunds = get(rewardsWithdrawalsAtom)
//   return rewardsFunds.length
// })

// /**
//  * Read-only
//  */
// export const rewardsFundsCountAtom = atom<number>((get) => {
//   const rewardsFunds = get(rewardsFundsAtom)
//   return rewardsFunds.length
// })

// /**
//  * Write-only
//  */
// export const addRewardsCreationAtom = atom<null, RewardsUpdate>(null, (get, set, rewardsUpdate) => {
//   const rewardsCreations = [...get(rewardsCreationsAtom)]

//   const index = findRewardsUpdateIndex(rewardsUpdate, rewardsCreations)
//   if (index !== -1) {
//     rewardsCreations[index] = rewardsUpdate
//   } else {
//     rewardsCreations.push(rewardsUpdate)
//   }
//   set(rewardsCreationsAtom, rewardsCreations)
// })

// /**
//  * Write-only
//  */
// export const removeRewardsCreationAtom = atom<null, RewardsId>(null, (get, set, rewardsId) => {
//   const _rewardsCreations = get(rewardsCreationsAtom)
//   const rewardsCreations = _rewardsCreations.filter(
//     (_rewardsUpdate) =>
//       _rewardsUpdate.delegator !== rewardsId.delegator || !_rewardsUpdate.slot.eq(rewardsId.slot)
//   )
//   set(rewardsCreationsAtom, rewardsCreations)
// })

// /**
//  * Write-only
//  */
// export const addRewardsUpdateAtom = atom<null, RewardsUpdate>(null, (get, set, rewardsUpdate) => {
//   const rewardsUpdates = [...get(rewardsUpdatesAtom)]

//   const index = findRewardsUpdateIndex(rewardsUpdate, rewardsUpdates)
//   if (index !== -1) {
//     rewardsUpdates[index] = rewardsUpdate
//   } else {
//     rewardsUpdates.push(rewardsUpdate)
//   }
//   set(rewardsUpdatesAtom, rewardsUpdates)
// })

// /**
//  * Write-only
//  */
// export const removeRewardsUpdateAtom = atom<null, RewardsId>(null, (get, set, rewardsId) => {
//   const _rewardsUpdates = get(rewardsUpdatesAtom)
//   const rewardsUpdates = _rewardsUpdates.filter(
//     (_rewardsUpdate) =>
//       _rewardsUpdate.delegator !== rewardsId.delegator || !_rewardsUpdate.slot.eq(rewardsId.slot)
//   )
//   set(rewardsUpdatesAtom, rewardsUpdates)
// })

// /**
//  * Write-only
//  * Queues up an update to fund a rewards
//  */
// export const addRewardsFundAtom = atom<null, RewardsFund>(null, (get, set, rewardsFund) => {
//   const rewardsFunds = [...get(rewardsFundsAtom)]
//   const index = findRewardsUpdateIndex(rewardsFund, rewardsFunds)
//   if (index !== -1) {
//     rewardsFunds[index] = rewardsFund
//   } else {
//     rewardsFunds.push(rewardsFund)
//   }
//   set(rewardsFundsAtom, rewardsFunds)
// })

// /**
//  * Write-only
//  * Removes the fund queued for an update
//  */
// export const removeRewardsFundAtom = atom<null, RewardsId>(null, (get, set, rewardsId) => {
//   const _rewardsFunds = [...get(rewardsFundsAtom)]
//   const rewardsFunds = _rewardsFunds.filter(
//     (_rewardsFund) =>
//       _rewardsFund.delegator !== rewardsId.delegator || !_rewardsFund.slot.eq(rewardsId.slot)
//   )
//   set(rewardsFundsAtom, rewardsFunds)
// })

// /**
//  * Write-only
//  * Queues up an update to set the balance of a rewards to 0
//  */
// export const addRewardsWithdrawalAtom = atom<null, RewardsId>(null, (get, set, rewardsId) => {
//   const rewardsFunds = [...get(rewardsWithdrawalsAtom)]
//   const index = findRewardsUpdateIndex(rewardsId, rewardsFunds)
//   const rewardsFund: RewardsFund = { ...rewardsId, amount: BigNumber.from(0) }
//   if (index !== -1) {
//     rewardsFunds[index] = rewardsFund
//   } else {
//     rewardsFunds.push(rewardsFund)
//   }
//   set(rewardsWithdrawalsAtom, rewardsFunds)
// })

// /**
//  * Write-only
//  * Removes the withdrawal queued for an update
//  */
// export const removeRewardsWithdrawalAtom = atom<null, RewardsId>(null, (get, set, rewardsId) => {
//   const _rewardsFunds = [...get(rewardsWithdrawalsAtom)]
//   const rewardsFunds = _rewardsFunds.filter(
//     (_rewardsFund) =>
//       _rewardsFund.delegator !== rewardsId.delegator || !_rewardsFund.slot.eq(rewardsId.slot)
//   )
//   set(rewardsWithdrawalsAtom, rewardsFunds)
// })

// ///////////////////////////// Modals /////////////////////////////

// /**
//  *
//  */
// export const editRewardsModalOpenAtom = atom<boolean>(false)

// /**
//  *
//  */
// export const createRewardsModalOpenAtom = atom<boolean>(false)

// /**
//  *
//  */
// export const rewardsUpdatesModalOpenAtom = atom<boolean>(false)

// /**
//  *
//  */
// export const rewardsIdToEditAtom = atom<RewardsId>(undefined as RewardsId)

// ///////////////////////////// Helpers /////////////////////////////

// /**
//  *
//  * @param rewardsId
//  * @param rewardss
//  * @returns
//  */
// const findRewardsUpdateIndex = (rewardsId: RewardsId, rewardss: RewardsId[]) =>
//   rewardss.findIndex(
//     (rewardss) => rewardss.slot.eq(rewardsId.slot) && rewardss.delegator === rewardsId.delegator
//   )
