import { useTicket } from '@hooks/v4/useTicket'
import { useTokenBalance } from '@pooltogether/hooks'
import { numberWithCommas } from '@pooltogether/utilities'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'

export const useTotalAmountDelegated = (chainId: number, delegator: string) => {
  const twabDelegator = getTwabDelegatorContractAddress(chainId)
  const ticket = useTicket(chainId)
  const {
    data: stakedDelegationBalance,
    isFetched: isDelegationBalanceFetched,
    refetch: refetchStakedBalance
  } = useTokenBalance(chainId, delegator, twabDelegator)
  const {
    data: delegations,
    isFetched: isDelegationsFetched,
    refetch: refetchDelegations
  } = useDelegatorsTwabDelegations(chainId, delegator)
  let amountUnformatted = BigNumber.from(0)

  // Staked amount
  if (isDelegationBalanceFetched) {
    amountUnformatted = amountUnformatted.add(stakedDelegationBalance.amountUnformatted)
  }

  // Delegated amounts
  if (isDelegationsFetched) {
    const totalDelegatedAmountUnformatted = delegations.reduce(
      (total, { delegation }) => total.add(delegation.balance),
      BigNumber.from(0)
    )
    amountUnformatted = amountUnformatted.add(totalDelegatedAmountUnformatted)
  }

  const refetch = () => {
    refetchStakedBalance()
    refetchDelegations()
  }
  const amount = formatUnits(amountUnformatted, ticket.decimals)
  return {
    data: {
      amount,
      amountUnformatted,
      amountPretty: numberWithCommas(amount) as string
    },
    isFetched: isDelegationBalanceFetched && isDelegationsFetched,
    refetch
  }
}
