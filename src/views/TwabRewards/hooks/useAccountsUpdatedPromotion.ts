import { DelegationId } from '@twabDelegator/interfaces'
import { useAccountsUpdatedPromotions } from './useAccountsUpdatedPromotions'

/**
 *
 * @param chainId
 * @param delegator
 * @param delegationId
 * @returns
 */
export const useAccountsUpdatedPromotion = (chainId: number, delegationId: DelegationId) => {
  const useQueryResult = useAccountsUpdatedPromotions(chainId, delegationId?.delegator)
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
