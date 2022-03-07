import {
  delegationCreationsAtom,
  delegationFundsAtom,
  delegationUpdatesAtom,
  delegationWithdrawalsAtom
} from '@twabDelegator/atoms'
import { useResetAtom } from 'jotai/utils'

export const useResetDelegationAtoms = () => {
  const resetDelegationUpdates = useResetAtom(delegationUpdatesAtom)
  const resetDelegationCreations = useResetAtom(delegationCreationsAtom)
  const resetDelegationFunds = useResetAtom(delegationFundsAtom)
  const resetDelegationWithdrawals = useResetAtom(delegationWithdrawalsAtom)
  return () => {
    resetDelegationUpdates()
    resetDelegationCreations()
    resetDelegationFunds()
    resetDelegationWithdrawals()
  }
}
