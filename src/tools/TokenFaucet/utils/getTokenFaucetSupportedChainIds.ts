import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { TOKEN_FAUCET_SUPPORTED_CHAIN_IDS } from '@tokenFaucet/config'

/**
 *
 * @returns
 */
export const getTokenFaucetSupportedChainIds = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? TOKEN_FAUCET_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : TOKEN_FAUCET_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
}
