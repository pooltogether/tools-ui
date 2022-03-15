import { useProvider } from 'wagmi'

/**
 * Returns the provider for the first wallet connected
 * @returns
 */
export const useWalletProvider = () => {
  return useProvider()
}
