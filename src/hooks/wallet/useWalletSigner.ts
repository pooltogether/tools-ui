import { useSigner } from 'wagmi'

/**
 * Returns the signer for the first wallet connected
 * @returns
 */
export const useWalletSigner = () => {
  const [{ data, error, loading }, getSigner] = useSigner()
  return data
}
