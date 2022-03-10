import { useWalletProvider } from './useWalletProvider'

/**
 * Returns the signer for the first wallet connected
 * @returns
 */
export const useWalletSigner = () => {
  const provider = useWalletProvider()
  console.log({ provider })
  return provider?.getSigner()
}
