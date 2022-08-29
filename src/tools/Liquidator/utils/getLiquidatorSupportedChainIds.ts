import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { LIQUIDATOR_SUPPORTED_CHAIN_IDS } from '../config'

/**
 * TODO: Add mainnet
 * @returns
 */
export const getLiquidatorSupportedChainIds = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? LIQUIDATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : LIQUIDATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
}
