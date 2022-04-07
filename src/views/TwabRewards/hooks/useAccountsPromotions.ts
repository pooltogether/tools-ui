import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { batch, contract } from '@pooltogether/etherplex'
import { getReadProvider } from '@pooltogether/utilities'
import { NO_REFETCH } from '@pooltogether/hooks/dist/constants'

import TwabRewardsAbi from '@twabRewards/abis/TwabRewards'
import { getTwabRewardsContractAddress } from '@twabRewards/utils/getTwabRewardsContractAddress'
import { Promotion, PromotionId } from '@twabRewards/interfaces'

/**
 *
 * @param chainId
 * @param account
 * @returns
 */
export const useAccountsPromotions = (chainId: number, account: string) => {
  return useQuery(
    ['useAccountsPromotions', account, chainId],
    async () => getUsersPromotionsWithIds(chainId, account),
    {
      ...NO_REFETCH,
      enabled: !!account
    }
  )
}

/**
 * @param chainId
 * @param account
 * @returns
 */
const getUsersPromotionsWithIds = async (chainId: number, account: string) => {
  const provider = getReadProvider(chainId)
  const twabRewardsAddress = getTwabRewardsContractAddress(chainId)

  const pageSize = 10
  let slotIndexOffset = 0
  let batchCalls = []

  const promotions: { promotion: Promotion }[] = []

  const twabRewardsContract = contract(twabRewardsAddress, TwabRewardsAbi, twabRewardsAddress)
  batchCalls.push(twabRewardsContract.getPromotion(BigNumber.from(1)))
  const response = await batch(provider, ...batchCalls)

  // hard-coded array until we have subgraph // console.log({ response })
  const arr = [0]
  arr.forEach((index) => {
    const promotionResponse: Promotion = response[twabRewardsAddress].getPromotion[index]
    console.log({ twabRewardsAddress })
    console.log({ promotionResponse })

    const promotion = {
      creator: promotionResponse.creator,
      startTimestamp: promotionResponse.startTimestamp,
      numberOfEpochs: promotionResponse.numberOfEpochs,
      createdAt: promotionResponse.createdAt,
      token: promotionResponse.token,
      tokensPerEpoch: promotionResponse.tokensPerEpoch,
      rewardsUnclaimed: promotionResponse.rewardsUnclaimed
    }
    promotions.push({
      promotion
    })
  })

  return promotions
}
