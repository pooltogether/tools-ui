import { APP_ENVIRONMENTS, useIsTestnets } from '@pooltogether/hooks'
import { TWAB_DELEGATOR_CHAIN_IDS } from '@twabDelegator/constants'

export const useTwabDelegatorChainIds = () => {
  const { isTestnets } = useIsTestnets()
  return isTestnets
    ? TWAB_DELEGATOR_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : TWAB_DELEGATOR_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
}
