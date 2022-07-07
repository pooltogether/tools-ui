import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { LIQUIDATOR_DEFAULT_CHAIN_ID } from '../config'

/**
 * TODO: Add mainnet
 * @returns
 */
export const getDefaultLiquidatorChainId = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? LIQUIDATOR_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.testnets]
    : LIQUIDATOR_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.testnets]
}
