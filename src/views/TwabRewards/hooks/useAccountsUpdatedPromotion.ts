import { PromotionId } from '@twabRewards/interfaces'
import { useAccountsUpdatedPromotions } from './useAccountsUpdatedPromotions'

/**
 *
 * @param chainId
 * @param promotionId
 * @returns
 */
export const useAccountsUpdatedPromotion = (chainId: number, promotionId: PromotionId) => {
  const useQueryResult = useAccountsUpdatedPromotions(chainId, promotionId?.account)
  if (!useQueryResult.isFetched)
    return {
      ...useQueryResult,
      data: null
    }
  const promotion = useQueryResult.data.find(
    (promotion) =>
      promotion.promotionId.account === promotionId.account &&
      promotion.promotionId.slot.eq(promotionId.slot)
  )
  return {
    ...useQueryResult,
    data: promotion
  }
}
