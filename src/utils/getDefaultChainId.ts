import { DEFAULT_CHAIN_IDS } from '@constants/config'
import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'

export const getDefaultChainId = () => {
  if (typeof window === 'undefined') return CHAIN_ID.mainnet

  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
  const defaultChainId = DEFAULT_CHAIN_IDS[appEnv]

  // TODO: Add in global selected chain id
  // const chainId = parseUrlNetwork()
  // if (Boolean(chainId)) {
  //   return chainId
  // }
  return defaultChainId
}
