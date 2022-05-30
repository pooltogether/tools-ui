import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { TWAB_REWARDS_SUPPORTED_CHAIN_IDS } from '@twabRewards/config'

/**
 *
 * @returns
 */
export const getRewardsSupportedChainIds = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? TWAB_REWARDS_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : TWAB_REWARDS_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
}
