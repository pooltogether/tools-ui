import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useEffect } from 'react'
import { useResetDelegationAtoms } from './useResetDelegationAtoms'

/**
 * Clears stored edits in atoms on an account change
 */
export const useResetDelegationAtomsOnAccountChange = () => {
  const usersAddress = useUsersAddress()
  const resetAtoms = useResetDelegationAtoms()

  useEffect(() => {
    if (!usersAddress) return
    resetAtoms()
  }, [usersAddress])
}
