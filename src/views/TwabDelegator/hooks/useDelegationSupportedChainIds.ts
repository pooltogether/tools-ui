import { APP_ENVIRONMENTS, useIsTestnets } from '@pooltogether/hooks'
import { TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS } from '@twabDelegator/config'

export const useDelegationSupportedChainIds = () => {
  const isTestnets = useIsTestnets()
  return isTestnets
    ? TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
}
