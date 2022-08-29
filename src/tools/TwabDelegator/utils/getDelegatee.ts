import { Delegation, DelegationUpdate } from '@twabDelegator/interfaces'

export const getDelegatee = (
  delegation?: Delegation,
  delegationCreation?: DelegationUpdate,
  delegationUpdate?: DelegationUpdate
) => {
  if (delegationCreation) return delegationCreation.delegatee
  if (delegationUpdate) return delegationUpdate.delegatee
  if (delegation) return delegation.delegatee
  return ''
}
