import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { TWAB_DELEGATOR_DEFAULT_CHAIN_ID } from '@twabDelegator/constants'

/**
 *
 * @returns
 */
export const getDefaultDelegationChainId = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? TWAB_DELEGATOR_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.testnets]
    : TWAB_DELEGATOR_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.testnets]
}
