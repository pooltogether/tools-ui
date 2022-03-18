import { CHAIN_ID } from '@constants/misc'
import { allChains, Chain } from 'wagmi'

const CHAIN_NAME_OVERRIDES = Object.freeze({
  [CHAIN_ID.mainnet]: 'Ethereum',
  [CHAIN_ID.avalanche]: 'Avalanche',
  [CHAIN_ID.fuji]: 'Fuji',
  [CHAIN_ID.polygon]: 'Polygon'
})

/**
 * Returns a WAGMI Chain data type from a chain id.
 * Builds objects with PoolTogether preferred names and RPC urls.
 * DOES NOT use RPC urls that include our API keys.
 * Used for wallet connection & adding chains to users wallets.
 * @param chainId
 * @returns
 */
export const getChain = (chainId: number): Chain => {
  let chain = findChain(chainId)
  editChainName(chain)
  return chain
}

/**
 * Finds default Chain objects from WAGMI.
 * Builds any that aren't included in WAGMI.
 * @param chainId
 * @returns
 */
const findChain = (chainId: number) => allChains.find((chain) => chain.id === chainId)

/**
 * Overwrites the name of the chain with PoolTogethers preferred name.
 * @param chain
 */
const editChainName = (chain: Chain) => {
  const override = CHAIN_NAME_OVERRIDES[chain.id]
  if (override) chain.name = override
}
