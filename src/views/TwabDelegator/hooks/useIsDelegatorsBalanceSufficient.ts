import { useTicket } from '@hooks/v4/useTicket'
import { useTokenBalance } from '@pooltogether/hooks'
import { useDelegationUpdatesNetDifference } from './useDelegationUpdatesNetDifference'

/**
 * Fetches the delegators ticket balances and checks if it is greater than the amount of tickets the user has committed to delegating while updating their delegations
 * @param chainId
 * @param delegator
 * @returns
 */
export const useIsDelegatorsBalanceSufficient = (chainId: number, delegator: string) => {
  const ticket = useTicket(chainId)
  const { data: tokenBalance, isFetched } = useTokenBalance(chainId, delegator, ticket.address)
  const totalDelegationAmount = useDelegationUpdatesNetDifference(chainId, delegator)

  if (!isFetched || !totalDelegationAmount) return null
  return tokenBalance.amountUnformatted.gte(totalDelegationAmount)
}
