import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'
import { getNetworkNameAliasByChainId, getReadProviders, getRpcUrls } from '@pooltogether/utilities'

import { CHAIN_ID } from '@constants/misc'

/////////////////////////////////////////////////////////////////////
// Constants pertaining to the networks and Prize Pools available in the app.
// When adding a new Prize Pool (or network) to the app, update all of these constants.
/////////////////////////////////////////////////////////////////////

export const V4_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: Array.from(new Set(mainnet.contracts.map((c) => c.chainId))),
  [APP_ENVIRONMENTS.testnets]: Array.from(new Set(testnet.contracts.map((c) => c.chainId)))
})

// TODO: Link this to the v3 constants
export const V3_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [CHAIN_ID.mainnet, CHAIN_ID.bsc, CHAIN_ID.polygon, CHAIN_ID.celo],
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.rinkeby, CHAIN_ID.mumbai]
})

export const SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: Array.from(
    new Set([
      ...V3_CHAIN_IDS[APP_ENVIRONMENTS.mainnets],
      ...V4_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
    ])
  ),
  [APP_ENVIRONMENTS.testnets]: Array.from(
    new Set([
      ...V3_CHAIN_IDS[APP_ENVIRONMENTS.testnets],
      ...V4_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    ])
  )
})

export const ALL_SUPPORTED_CHAIN_IDS = [
  ...SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets],
  ...SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
]

export const RPC_URLS = getRpcUrls(ALL_SUPPORTED_CHAIN_IDS, {
  alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  infura: process.env.NEXT_PUBLIC_INFURA_ID
})

console.log({
  RPC_URLS,
  keys: {
    alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
    infura: process.env.NEXT_PUBLIC_INFURA_ID
  }
})

export const READ_PROVIDERS = Object.freeze({
  ...getReadProviders(SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]),
  ...getReadProviders(SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets])
})

export const SUPPORTED_CHAIN_NAMES = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets].map(
    getNetworkNameAliasByChainId
  ),
  [APP_ENVIRONMENTS.testnets]: SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets].map(
    getNetworkNameAliasByChainId
  )
})

export const DEFAULT_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.mumbai
})

// Native currency symbols in app
export const CHAIN_NATIVE_CURRENCY = Object.freeze({
  [CHAIN_ID.mainnet]: 'Ξ',
  [CHAIN_ID.rinkeby]: 'Ξ',
  [CHAIN_ID.matic]: 'MATIC',
  [CHAIN_ID.mumbai]: 'MATIC',
  [CHAIN_ID.avalanche]: 'AVAX',
  [CHAIN_ID.fuji]: 'AVAX'
})
