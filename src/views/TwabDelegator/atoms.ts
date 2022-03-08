import {
  Delegation,
  DelegationFormValues,
  DelegationFund,
  DelegationId,
  DelegationUpdate
} from '@twabDelegator/interfaces'
import { BigNumber } from 'ethers'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

// TODO: Reset atoms when switching accounts

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
        _delegationUpdate.delegator !== delegationId.delegator &&
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
        _delegationUpdate.delegator !== delegationId.delegator &&
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
      _delegationFund.delegator !== delegationId.delegator &&
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
        _delegationFund.delegator !== delegationId.delegator &&
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
export const delegationFormDefaultsAtom = atom<DelegationFormValues>(
  undefined as DelegationFormValues
)

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
