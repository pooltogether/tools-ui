import gql from 'graphql-tag'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { NO_REFETCH } from '@pooltogether/hooks/dist/constants'

import { Promotion, PromotionId } from '@twabRewards/interfaces'
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
      ...NO_REFETCH,
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

const promotionFragment = gql`
  fragment promotionFragment on Promotion {
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
`

const promotionsQuery = () => {
  return gql`
    query promotionsQuery($accountAddress: String!) {
      promotions(where: { creator: $accountAddress }) {
        ...promotionFragment
      }
    }
    ${promotionFragment}
  `
}

const retryCodes = [408, 500, 502, 503, 504, 522, 524]
const sleep = async (retry) => await new Promise((r) => setTimeout(r, 500 * retry))

/**
 * Custom fetch wrapper for the query clients so we can handle errors better and retry queries
 * NOTE: retries is starting at 3 so we don't actually retrys
 * @param {*} request
 * @param {*} options
 * @param {*} retry
 * @returns
 */
const theGraphCustomFetch = async (request, options, retry = 3) =>
  fetch(request, options)
    .then(async (response) => {
      if (response.ok) return response

      if (retry < 3 && retryCodes.includes(response.status)) {
        await sleep(retry)
        return theGraphCustomFetch(request, options, retry + 1)
      }

      throw new Error(JSON.stringify(response))
    })
    .catch((reason) => {
      console.log(reason)
      return reason
    })
