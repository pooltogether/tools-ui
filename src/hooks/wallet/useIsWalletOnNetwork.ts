import { useWalletChainId } from './useWalletChainId'

export const useIsWalletOnNetwork = (requiredChainId: number) => {
  const chainId = useWalletChainId()
  return chainId === requiredChainId
}
