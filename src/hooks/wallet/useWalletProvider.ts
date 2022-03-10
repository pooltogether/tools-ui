import { getPriorityConnector } from '@web3-react/core'
import { CONNECTORS } from '../../connectors'

const { usePriorityProvider } = getPriorityConnector(...CONNECTORS)

/**
 * Returns the provider for the first wallet connected
 * @returns
 */
export const useWalletProvider = () => {
  return usePriorityProvider()
}
