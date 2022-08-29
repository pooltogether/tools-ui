import { DelegationId } from '@twabDelegator/interfaces'
import { useDelegatorsUpdatedTwabDelegations } from './useDelegatorsUpdatedTwabDelegations'

/**
 *
 * @param chainId
 * @param delegator
 * @param delegationId
 * @returns
 */
export const useDelegatorsUpdatedTwabDelegation = (chainId: number, delegationId: DelegationId) => {
  const useQueryResult = useDelegatorsUpdatedTwabDelegations(chainId, delegationId?.delegator)
  if (!useQueryResult.isFetched)
    return {
      ...useQueryResult,
      data: null
    }
  const delegation = useQueryResult.data.find(
    (delegation) =>
      delegation.delegationId.delegator === delegationId.delegator &&
      delegation.delegationId.slot.eq(delegationId.slot)
  )
  return {
    ...useQueryResult,
    data: delegation
  }
}
