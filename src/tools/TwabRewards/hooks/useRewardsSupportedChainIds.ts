import { APP_ENVIRONMENTS, useIsTestnets } from '@pooltogether/hooks'
import { TWAB_REWARDS_SUPPORTED_CHAIN_IDS } from '@twabRewards/config'

export const useRewardsSupportedChainIds = () => {
  const { isTestnets } = useIsTestnets()
  return isTestnets
    ? TWAB_REWARDS_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : TWAB_REWARDS_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
}
