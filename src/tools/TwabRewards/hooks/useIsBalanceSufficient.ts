import { useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { BigNumber } from 'ethers'

/**
 * Fetches the delegators ticket balances and checks if it is greater than the amount of tickets the user has committed to delegating while updating their delegations
 * @param chainId
 * @param delegator
 * @returns
 */
export const useIsBalanceSufficient = (chainId: number, amount: BigNumber, token: string) => {
  const usersAddress = useUsersAddress()
  const { data: tokenBalance, isFetched } = useTokenBalance(chainId, usersAddress, token)

  if (!isFetched || !amount || !tokenBalance?.amountUnformatted) return null

  return tokenBalance.amountUnformatted.gte(amount)
}
