import { DelegationId } from '@twabDelegator/interfaces'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'

export const useDelegatorsTwabDelegation = (
  chainId: number,
  delegator: string,
  delegationId: DelegationId
) => {
  const useQueryResult = useDelegatorsTwabDelegations(chainId, delegator)
  if (!useQueryResult.isFetched) {
    return {
      ...useQueryResult,
      data: null
    }
  }
  const delegation = useQueryResult.data.find(
    (delegationData) =>
      delegationData.delegationId.delegator === delegationId.delegator &&
      delegationData.delegationId.slot.eq(delegationId.slot)
  )
  return {
    ...useQueryResult,
    data: delegation
  }
}
