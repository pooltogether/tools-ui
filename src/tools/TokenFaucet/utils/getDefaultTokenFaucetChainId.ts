import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { TOKEN_FAUCET_DEFAULT_CHAIN_ID } from '@tokenFaucet/config'

/**
 *
 * @returns
 */
export const getDefaultTokenFaucetChainId = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? TOKEN_FAUCET_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.testnets]
    : TOKEN_FAUCET_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.mainnets]
}
