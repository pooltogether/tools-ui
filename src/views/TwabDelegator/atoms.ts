import { Delegation } from '@twabDelegator/interfaces'
import { BigNumber } from 'ethers'
import { atom } from 'jotai'

/**
 *
 */
export const delegationUpdatesAtom = atom<{ [slotIndex: string]: Partial<Delegation> }>({})

/**
 *
 */
export const delegationEditsCountAtom = atom<number>((get) => {
  const delegations = get(delegationUpdatesAtom)
  let editsCount = 0
  Object.values(delegations).forEach((delegation) => {
    const editCount = Object.keys(delegation).length
    editsCount += editCount
  })
  return editsCount
})

/**
 *
 */
export const delegationWithdrawlsCountAtom = atom<number>((get) => {
  const delegations = get(delegationUpdatesAtom)
  let withdrawlsCount = 0
  Object.values(delegations).forEach((delegation) => {
    if (delegation?.balance.isZero()) {
      withdrawlsCount++
    }
  })
  return withdrawlsCount
})

/**
 *
 */
export const addDelegationUpdateAtom = atom<
  null,
  { slotIndex: string; delegation: Partial<Delegation> }
>(null, (get, set, update) => {
  const { slotIndex, delegation } = update
  const delegations = get(delegationUpdatesAtom)
  delegations[slotIndex] = delegation
  set(delegationUpdatesAtom, delegations)
})

/**
 * Queues up an update to set the balance of the slot to 0
 */
export const withdrawFromSlotAtom = atom<null, string>(null, (get, set, slotIndex) => {
  const delegations = get(delegationUpdatesAtom)
  const delegation = delegations[slotIndex] || {}
  delegation.balance = BigNumber.from(0)
  if (Object.keys(delegation).length === 0) {
    delete delegations[slotIndex]
  } else {
    delegations[slotIndex] = delegation
  }
  console.log('withdrawFromSlotAtom', { delegations, slotIndex })
  set(delegationUpdatesAtom, delegations)
})

/**
 * Removes the balance queued for an update
 */
export const removeWithdrawFromSlotAtom = atom<null, string>(null, (get, set, slotIndex) => {
  const delegations = get(delegationUpdatesAtom)
  const delegation = delegations[slotIndex]
  delete delegation.balance
  delegations[slotIndex] = delegation
  console.log('removeWithdrawFromSlotAtom', { delegations, slotIndex })
  set(delegationUpdatesAtom, delegations)
})

/**
 *
 */
export const removeDelegationUpdateAtom = atom<
  null,
  { slotIndex: string; delegation: Partial<Delegation> }
>(null, (get, set, update) => {
  const { slotIndex, delegation: _delegation } = update
  const delegations = get(delegationUpdatesAtom)
  const keys = Object.keys(_delegation)
  const delegation = delegations[slotIndex]
  keys.forEach((key) => delete delegation[key])
  delegations[slotIndex] = delegation
  set(delegationUpdatesAtom, delegations)
})
