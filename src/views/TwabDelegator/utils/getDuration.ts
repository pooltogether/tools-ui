import { msToS, sToD } from '@pooltogether/utilities'
import { Delegation, DelegationUpdate } from '@twabDelegator/interfaces'

/**
 * Returns the duration in seconds
 * @param delegation
 * @param delegationCreation
 * @param delegationUpdate
 * @returns
 */
export const getDuration = (
  delegation?: Delegation,
  delegationCreation?: DelegationUpdate,
  delegationUpdate?: DelegationUpdate
) => {
  if (delegationCreation) return delegationCreation.lockDuration
  if (delegationUpdate) return delegationUpdate.lockDuration
  if (delegation) {
    const currentTimeInSeconds = msToS(Date.now())
    const lockUntilInSeconds = delegation.lockUntil.toNumber()
    const timeRemaining = lockUntilInSeconds - currentTimeInSeconds
    return timeRemaining
  }
  return 0
}
