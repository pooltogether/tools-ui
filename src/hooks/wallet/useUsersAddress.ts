import { getPriorityConnector } from '@web3-react/core'
import { CONNECTORS } from '../../connectors'

const { usePriorityAccount } = getPriorityConnector(...CONNECTORS)

/**
 * Returns the address of the first wallet connected
 * @returns
 */
export const useUsersAddress = () => {
  return usePriorityAccount()?.toLowerCase()
}
