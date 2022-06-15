import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { FAUCET_SUPPORTED_CHAIN_IDS } from '../config'

/**
 * @returns
 */
export const getTestnetFaucetChainIds = () => {
  return FAUCET_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
}
