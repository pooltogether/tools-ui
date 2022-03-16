import { getAddress } from 'ethers/lib/utils'
import { useAccount } from 'wagmi'

/**
 * Returns the address of the first wallet connected.
 * Checksums it for easier checks throughout the app.
 * @returns
 */
export const useUsersAddress = () => {
  const [{ data }] = useAccount()
  return data ? getAddress(data.address) : null
}
