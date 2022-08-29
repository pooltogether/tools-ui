import { LIQUIDATOR_SUPPORTED_CHAIN_IDS } from '@liquidator/config'
import { APP_ENVIRONMENTS, useIsTestnets } from '@pooltogether/hooks'

/**
 * TODO: Add mainnets
 * @returns
 */
export const useLiquidatorSupportedChainIds = () => {
  const { isTestnets } = useIsTestnets()
  return isTestnets
    ? LIQUIDATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : LIQUIDATOR_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
}
