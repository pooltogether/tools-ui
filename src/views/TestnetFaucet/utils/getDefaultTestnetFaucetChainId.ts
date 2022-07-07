import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { FAUCET_DEFAULT_CHAIN_ID } from '../config'

/**
 * @returns
 */
export const getDefaultTestnetFaucetChainId = () => {
  return FAUCET_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.testnets]
}
