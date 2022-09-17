import { getChainIdByAlias, getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { DelegationFund, DelegationId, DelegationUpdate } from '@twabDelegator/interfaces'
import { getUrlQueryParam } from '@utils/getUrlQueryParam'
import { BigNumber } from 'ethers'
import { getAddress, isAddress } from 'ethers/lib/utils'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { QUERY_PARAM } from './constants'
import { getDefaultDelegationChainId } from './utils/getDefaultDelegationChainId'
import { getDelegationSupportedChainIds } from './utils/getDelegationSupportedChainIds'

/**
 * The starting delegator value for the delegation view.
 */
const getStartingDelegator = () => {
  const delegator = getUrlQueryParam(QUERY_PARAM.delegator, null, null, [(v) => isAddress(v)])
  return delegator ? getAddress(delegator) : null
}

/**
 * The address to use as the delegator for the delegation view
 */
export const delegatorAtom = atom<string>('')
delegatorAtom.onMount = (setAtom) => setAtom(getStartingDelegator())

/**
 * Write-only
 */
export const setDelegatorAtom = atom<null, string>(null, (get, set, _delegator) => {
  if (!_delegator) {
    set(delegatorAtom, null)
    return
  }
  const delegator = getAddress(_delegator)
  const url = new URL(window.location.href)
  url.searchParams.set(QUERY_PARAM.delegator, delegator)
  window.history.pushState(null, '', url)
  set(delegatorAtom, delegator)
})

/**
 * Tries to get the chain id from a query param, otherwise returns the default
 * @returns
 */
const getStartingDelegationChainId = () => {
  const defaultChainId = getDefaultDelegationChainId()
  const delegationChainAlias = getUrlQueryParam(QUERY_PARAM.delegationChain)
  if (!delegationChainAlias) return defaultChainId
  const queryParamChainId = getChainIdByAlias(delegationChainAlias)
  const supportedChainIds = getDelegationSupportedChainIds()
  if (supportedChainIds.includes(queryParamChainId)) return queryParamChainId
  return defaultChainId
}

/**
 * The chain id to use for the delegation view.
 * TODO: Eventually we'll need to update this to a specific deployment when there are more than 1 on a chain.
 */
export const delegationChainIdAtom = atom<number>(0)
delegationChainIdAtom.onMount = (setAtom) => setAtom(getStartingDelegationChainId())

/**
 * Write-only
 */
export const setDelegationChainAtom = atom<null, number>(null, (get, set, chainId) => {
  if (!chainId) {
    set(delegationChainIdAtom, undefined)
    return
  }
  const chainName = getNetworkNameAliasByChainId(chainId)
  const url = new URL(window.location.href)
  url.searchParams.set(QUERY_PARAM.delegationChain, chainName)
  window.history.pushState(null, '', url)
  set(delegationChainIdAtom, chainId)
})

/**
 *
 */
export const delegationCreationsAtom = atomWithReset<DelegationUpdate[]>([])

/**
 *
 */
export const delegationUpdatesAtom = atomWithReset<DelegationUpdate[]>([])

/**
 *
 */
export const delegationFundsAtom = atomWithReset<DelegationFund[]>([])

/**
 *
 */
export const delegationWithdrawalsAtom = atomWithReset<DelegationFund[]>([])

/**
 * Read-only
 */
export const delegationCreationsCountAtom = atom<number>((get) => {
  const delegationCreations = get(delegationCreationsAtom)
  return delegationCreations.length
})

/**
 * Read-only
 */
export const delegationUpdatesCountAtom = atom<number>((get) => {
  const delegationUpdates = get(delegationUpdatesAtom)
  return delegationUpdates.length
})

/**
 * Read-only
 */
export const delegationUpdatedLocksCountAtom = atom<number>((get) => {
  const delegationUpdates = get(delegationUpdatesAtom)
  const delegationCreations = get(delegationCreationsAtom)
  const updateLocks = delegationUpdates.reduce(
    (count, delegationUpdate) => (delegationUpdate.lockDuration ? count + 1 : count),
    0
  )

  const creationLocks = delegationCreations.reduce(
    (count, delegationCreation) => (delegationCreation.lockDuration ? count + 1 : count),
    0
  )

  return updateLocks + creationLocks
})

/**
 * Read-only
 */
export const delegationWithdrawlsCountAtom = atom<number>((get) => {
  const delegationFunds = get(delegationWithdrawalsAtom)
  return delegationFunds.length
})

/**
 * Read-only
 */
export const delegationFundsCountAtom = atom<number>((get) => {
  const delegationFunds = get(delegationFundsAtom)
  return delegationFunds.length
})

/**
 * Write-only
 */
export const addDelegationCreationAtom = atom<null, DelegationUpdate>(
  null,
  (get, set, delegationUpdate) => {
    const delegationCreations = [...get(delegationCreationsAtom)]

    const index = findDelegationUpdateIndex(delegationUpdate, delegationCreations)
    if (index !== -1) {
      delegationCreations[index] = delegationUpdate
    } else {
      delegationCreations.push(delegationUpdate)
    }
    set(delegationCreationsAtom, delegationCreations)
  }
)

/**
 * Write-only
 */
export const removeDelegationCreationAtom = atom<null, DelegationId>(
  null,
  (get, set, delegationId) => {
    const _delegationCreations = get(delegationCreationsAtom)
    const delegationCreations = _delegationCreations.filter(
      (_delegationUpdate) =>
        _delegationUpdate.delegator !== delegationId.delegator ||
        !_delegationUpdate.slot.eq(delegationId.slot)
    )
    set(delegationCreationsAtom, delegationCreations)
  }
)

/**
 * Write-only
 */
export const addDelegationUpdateAtom = atom<null, DelegationUpdate>(
  null,
  (get, set, delegationUpdate) => {
    const delegationUpdates = [...get(delegationUpdatesAtom)]

    const index = findDelegationUpdateIndex(delegationUpdate, delegationUpdates)
    if (index !== -1) {
      delegationUpdates[index] = delegationUpdate
    } else {
      delegationUpdates.push(delegationUpdate)
    }
    set(delegationUpdatesAtom, delegationUpdates)
  }
)

/**
 * Write-only
 */
export const removeDelegationUpdateAtom = atom<null, DelegationId>(
  null,
  (get, set, delegationId) => {
    const _delegationUpdates = get(delegationUpdatesAtom)
    const delegationUpdates = _delegationUpdates.filter(
      (_delegationUpdate) =>
        _delegationUpdate.delegator !== delegationId.delegator ||
        !_delegationUpdate.slot.eq(delegationId.slot)
    )
    set(delegationUpdatesAtom, delegationUpdates)
  }
)

/**
 * Write-only
 * Queues up an update to fund a delegation
 */
export const addDelegationFundAtom = atom<null, DelegationFund>(
  null,
  (get, set, delegationFund) => {
    const delegationFunds = [...get(delegationFundsAtom)]
    const index = findDelegationUpdateIndex(delegationFund, delegationFunds)
    if (index !== -1) {
      delegationFunds[index] = delegationFund
    } else {
      delegationFunds.push(delegationFund)
    }
    set(delegationFundsAtom, delegationFunds)
  }
)

/**
 * Write-only
 * Removes the fund queued for an update
 */
export const removeDelegationFundAtom = atom<null, DelegationId>(null, (get, set, delegationId) => {
  const _delegationFunds = [...get(delegationFundsAtom)]
  const delegationFunds = _delegationFunds.filter(
    (_delegationFund) =>
      _delegationFund.delegator !== delegationId.delegator ||
      !_delegationFund.slot.eq(delegationId.slot)
  )
  set(delegationFundsAtom, delegationFunds)
})

/**
 * Write-only
 * Queues up an update to set the balance of a delegation to 0
 */
export const addDelegationWithdrawalAtom = atom<null, DelegationId>(
  null,
  (get, set, delegationId) => {
    const delegationFunds = [...get(delegationWithdrawalsAtom)]
    const index = findDelegationUpdateIndex(delegationId, delegationFunds)
    const delegationFund: DelegationFund = { ...delegationId, amount: BigNumber.from(0) }
    if (index !== -1) {
      delegationFunds[index] = delegationFund
    } else {
      delegationFunds.push(delegationFund)
    }
    set(delegationWithdrawalsAtom, delegationFunds)
  }
)

/**
 * Write-only
 * Removes the withdrawal queued for an update
 */
export const removeDelegationWithdrawalAtom = atom<null, DelegationId>(
  null,
  (get, set, delegationId) => {
    const _delegationFunds = [...get(delegationWithdrawalsAtom)]
    const delegationFunds = _delegationFunds.filter(
      (_delegationFund) =>
        _delegationFund.delegator !== delegationId.delegator ||
        !_delegationFund.slot.eq(delegationId.slot)
    )
    set(delegationWithdrawalsAtom, delegationFunds)
  }
)

///////////////////////////// Modals /////////////////////////////

/**
 *
 */
export const editDelegationModalOpenAtom = atom<boolean>(false)

/**
 *
 */
export const createDelegationModalOpenAtom = atom<boolean>(false)

/**
 *
 */
export const delegationUpdatesModalOpenAtom = atom<boolean>(false)

/**
 *
 */
export const delegationIdToEditAtom = atom<DelegationId>(undefined as DelegationId)

///////////////////////////// Helpers /////////////////////////////

/**
 *
 * @param delegationId
 * @param delegations
 * @returns
 */
const findDelegationUpdateIndex = (delegationId: DelegationId, delegations: DelegationId[]) =>
  delegations.findIndex(
    (delegations) =>
      delegations.slot.eq(delegationId.slot) && delegations.delegator === delegationId.delegator
  )
