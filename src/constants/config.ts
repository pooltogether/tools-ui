import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS } from '@twabDelegator/config'
import { CHAIN_ID, getChain } from '@pooltogether/wallet-connection'
import { Chain } from 'wagmi'
import { LIQUIDATOR_SUPPORTED_CHAIN_IDS } from '@liquidator/config'

/////////////////////////////////////////////////////////////////////
// Required constant aggregates from the various tools in the app.
// When adding a new tool (or network) to the app, ensure these constants are updated.
// Ideally from a config.ts inside the respective tool.
/////////////////////////////////////////////////////////////////////

export const RPC_URLS = {
  // Ethereum
  [CHAIN_ID.mainnet]: process.env.NEXT_PUBLIC_ETHEREUM_MAINNET_RPC_URL,
  [CHAIN_ID.rinkeby]: process.env.NEXT_PUBLIC_ETHEREUM_RINKEBY_RPC_URL,
  [CHAIN_ID.ropsten]: process.env.NEXT_PUBLIC_ETHEREUM_ROPSTEN_RPC_URL,
  [CHAIN_ID.kovan]: process.env.NEXT_PUBLIC_ETHEREUM_KOVAN_RPC_URL,
  [CHAIN_ID.goerli]: process.env.NEXT_PUBLIC_ETHEREUM_GOERLI_RPC_URL,
  // Avalanche
  [CHAIN_ID.avalanche]: process.env.NEXT_PUBLIC_AVALANCHE_MAINNET_RPC_URL,
  [CHAIN_ID.fuji]: process.env.NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL,
  // Polygon
  [CHAIN_ID.polygon]: process.env.NEXT_PUBLIC_POLYGON_MAINNET_RPC_URL,
  [CHAIN_ID.mumbai]: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL,
  // Optimism
  [CHAIN_ID.optimism]: process.env.NEXT_PUBLIC_OPTIMISM_MAINNET_RPC_URL,
  [CHAIN_ID['optimism-goerli']]: process.env.NEXT_PUBLIC_OPTIMISM_GOERLI_RPC_URL,
  // Arbitrum
  [CHAIN_ID.arbitrum]: process.env.NEXT_PUBLIC_ARBITRUM_MAINNET_RPC_URL,
  [CHAIN_ID['arbitrum-goerli']]: process.env.NEXT_PUBLIC_ARBITRUM_GOERLI_RPC_URL,
  // Celo
  [CHAIN_ID.celo]: process.env.NEXT_PUBLIC_CELO_MAINNET_RPC_URL,
  [CHAIN_ID['celo-testnet']]: process.env.NEXT_PUBLIC_CELO_TESTNET_RPC_URL
}

export const SUPPORTED_CHAIN_IDS: {
  [key: string]: number[]
} = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: Array.from(
    new Set([
      ...TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets],
      ...LIQUIDATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
    ])
  ),
  [APP_ENVIRONMENTS.testnets]: Array.from(
    new Set([
      ...TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets],
      ...LIQUIDATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    ])
  )
})

export const SUPPORTED_CHAINS: { [key: string]: Chain[] } = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets].map(getChain),
  [APP_ENVIRONMENTS.testnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets].map(getChain)
})

export const ALL_SUPPORTED_CHAINS: Chain[] = [
  ...SUPPORTED_CHAINS[APP_ENVIRONMENTS.mainnets],
  ...SUPPORTED_CHAINS[APP_ENVIRONMENTS.testnets]
]
