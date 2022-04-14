import { useTicket } from '@hooks/v4/useTicket'
import { useTokenBalance } from '@pooltogether/hooks'
import { delegationFundsAtom } from '@twabDelegator/atoms'
import { BigNumber } from 'ethers'
import { useAtom } from 'jotai'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'

/**
 * Fetches the delegators ticket balances and checks if it is greater than the amount of tickets the user has committed to delegating while updating their delegations
 * @param chainId
 * @param delegator
 * @returns
 */
export const useIsDelegatorsBalanceSufficient = (chainId: number, delegator: string) => {
  const ticket = useTicket(chainId)
  const { data: tokenBalance, isFetched } = useTokenBalance(chainId, delegator, ticket.address)
  const totalDelegationAmount = useTotalDelegationUpdateAmount(chainId, delegator)

  if (!isFetched || !totalDelegationAmount) return null
  return tokenBalance.amountUnformatted.gte(totalDelegationAmount)
}

const useTotalDelegationUpdateAmount = (chainId: number, delegator: string) => {
  const { data: delegations, isFetched } = useDelegatorsTwabDelegations(chainId, delegator)
  const [delegationFunds] = useAtom(delegationFundsAtom)

  if (!isFetched) return null

  return delegationFunds.reduce((total, delegationFund) => {
    const delegation = delegations.find(
      (delegation) =>
        delegation.delegationId.slot.eq(delegationFund.slot) &&
        delegation.delegationId.delegator === delegationFund.delegator
    )

    let amountToFund
    if (!!delegation) {
      amountToFund = delegationFund.amount.sub(delegation.delegation.balance)
    } else {
      amountToFund = delegationFund.amount
    }

    return total.add(amountToFund)
  }, BigNumber.from(0))
}
