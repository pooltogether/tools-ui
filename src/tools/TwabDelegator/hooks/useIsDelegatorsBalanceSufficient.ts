import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { useTokenBalance } from '@pooltogether/hooks'
import { delegationFundsAtom } from '@twabDelegator/atoms'
import { DelegationFund } from '@twabDelegator/interfaces'
import { useAtom } from 'jotai'
import { useDelegationUpdatesNetDifference } from './useDelegationUpdatesNetDifference'
import { useIsAmountSufficientForFunds } from './useIsAmountSufficientForFunds'

/**
 * Fetches the delegators ticket balances and checks if it is greater than the amount of tickets the user has committed to delegating while updating their delegations
 * @param chainId
 * @param delegator
 * @returns
 */
export const useIsDelegatorsBalanceSufficient = (
  chainId: number,
  delegator: string,
  delegationFunds: DelegationFund[]
) => {
  const ticket = useV4Ticket(chainId)
  const { data: tokenBalance, isFetched } = useTokenBalance(chainId, delegator, ticket.address)
  return useIsAmountSufficientForFunds(
    chainId,
    delegator,
    tokenBalance?.amountUnformatted,
    delegationFunds
  )
}
