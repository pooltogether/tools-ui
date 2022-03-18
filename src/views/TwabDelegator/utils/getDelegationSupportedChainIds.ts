import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS } from '@twabDelegator/config'

/**
 *
 * @returns
 */
export const getDelegationSupportedChainIds = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
}
