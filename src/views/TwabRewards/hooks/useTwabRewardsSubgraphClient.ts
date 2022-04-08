import { GraphQLClient } from 'graphql-request'

import { CHAIN_ID } from '@constants/misc'

const POOLTOGETHER_GOVERNANCE_GRAPH_URIS = {
  [CHAIN_ID.rinkeby]: '',
  [CHAIN_ID.mumbai]: '',
  [CHAIN_ID.fuji]: '',
  [CHAIN_ID.avalanche]: '',
  [CHAIN_ID.mainnet]: '',
  [CHAIN_ID.polygon]: `https://api.thegraph.com/subgraphs/name/pooltogether/polygon-twab-rewards`
}

export const useTwabRewardsSubgraphUri = (chainId) => {
  return POOLTOGETHER_GOVERNANCE_GRAPH_URIS[chainId]
}

export const useTwabRewardsSubgraphClient = (chainId) => {
  const uri = useTwabRewardsSubgraphUri(chainId)

  return new GraphQLClient(uri, {
    fetch: theGraphCustomFetch
  })
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
