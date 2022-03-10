import { getPriorityConnector } from '@web3-react/core'
import { CONNECTORS } from '../../connectors'

const { usePriorityChainId } = getPriorityConnector(...CONNECTORS)

export const useIsWalletOnNetwork = (requiredChainId: number) => {
  const chainId = usePriorityChainId()
  return chainId === requiredChainId
}
