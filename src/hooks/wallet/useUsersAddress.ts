import { useAccount } from 'wagmi'

/**
 * Returns the address of the first wallet connected
 * @returns
 */
export const useUsersAddress = () => {
  const [{ data, error, loading }, disconnect] = useAccount()

  return data?.address
}
