import { GraphQLClient } from 'graphql-request'

import { CHAIN_ID } from '@constants/misc'
import { theGraphCustomFetch } from '@utils/theGraphCustomFetch'

const POOLTOGETHER_GOVERNANCE_GRAPH_URIS = {
  [CHAIN_ID.rinkeby]: 'https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-twab-rewards',
  [CHAIN_ID.mumbai]: 'https://api.thegraph.com/subgraphs/name/pooltogether/mumbai-twab-rewards',
  [CHAIN_ID.fuji]: 'https://api.thegraph.com/subgraphs/name/pooltogether/fuji-twab-rewards',
  [CHAIN_ID.avalanche]: `https://api.thegraph.com/subgraphs/name/pooltogether/avalanche-twab-rewards`,
  [CHAIN_ID.mainnet]: `https://api.thegraph.com/subgraphs/name/pooltogether/mainnet-twab-rewards`,
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
