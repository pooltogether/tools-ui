import { Delegation } from '@twabDelegator/interfaces'

export const getIsDelegationLocked = (delegation: Delegation) => {
  const currentTimeMs = Date.now()
  return delegation.lockUntil.gte(currentTimeMs)
}
