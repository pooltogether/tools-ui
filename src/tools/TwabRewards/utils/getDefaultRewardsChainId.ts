import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { TWAB_REWARDS_DEFAULT_CHAIN_ID } from '@twabRewards/config'

/**
 *
 * @returns
 */
export const getDefaultRewardsChainId = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? TWAB_REWARDS_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.testnets]
    : TWAB_REWARDS_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.mainnets]
}
