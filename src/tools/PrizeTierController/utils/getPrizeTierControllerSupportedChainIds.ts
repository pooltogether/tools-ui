import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { PRIZE_TIER_CONTROLLER_SUPPORTED_CHAIN_IDS } from '../config'

/**
 *
 * @returns
 */
export const getPrizeTierControllerSupportedChainIds = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? PRIZE_TIER_CONTROLLER_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : PRIZE_TIER_CONTROLLER_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
}
