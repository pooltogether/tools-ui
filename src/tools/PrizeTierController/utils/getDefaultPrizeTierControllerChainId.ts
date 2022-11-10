import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { PRIZE_TIER_CONTROLLER_DEFAULT_CHAIN_ID } from '../config'

/**
 *
 * @returns
 */
export const getDefaultPrizeTierControllerChainId = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? PRIZE_TIER_CONTROLLER_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.testnets]
    : PRIZE_TIER_CONTROLLER_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.mainnets]
}
