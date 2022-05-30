import gql from 'graphql-tag'
import { useQuery } from 'react-query'

import { useTwabRewardsSubgraphClient } from '@twabRewards/hooks/useTwabRewardsSubgraphClient'

/**
 *
 * @param chainId
 * @param account
 * @returns Promotion[]
 */
export const useAccountsPromotions = (chainId: number, account: string) => {
  return useQuery(
    ['useAccountPromotions', account, chainId],
    async () => getAccountsPromotions(chainId, account),
    {
      enabled: !!account
    }
  )
}

export const getAccountsPromotions = async (chainId, account) => {
  const query = promotionsQuery()
  const variables = {
    accountAddress: account.toLowerCase()
  }

  const client = useTwabRewardsSubgraphClient(chainId)

  return client.request(query, variables).catch((e) => {
    console.error(e.message)
    return null
  })
}

const promotionsQuery = () => {
  return gql`
    query promotionsQuery($accountAddress: String!) {
      promotions(where: { creator: $accountAddress }) {
        id
        creator
        createdAt
        startTimestamp
        numberOfEpochs
        epochDuration
        tokensPerEpoch
        rewardsUnclaimed
        token
        ticket
      }
    }
  `
}
