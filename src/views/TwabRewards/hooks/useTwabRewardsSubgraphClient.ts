import { GraphQLClient } from 'graphql-request'

import { CHAIN_ID } from '@constants/misc'
import { theGraphCustomFetch } from '@utils/theGraphCustomFetch'

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
