import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { numberWithCommas } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'

export const useTotalAmountDelegated = (chainId: number, delegator: string) => {
  const ticket = useV4Ticket(chainId)
  const {
    data: delegations,
    isFetched: isDelegationsFetched,
    refetch: refetchDelegations
  } = useDelegatorsTwabDelegations(chainId, delegator)

  let amountUnformatted = BigNumber.from(0)

  // Delegated amounts
  if (isDelegationsFetched) {
    const totalDelegatedAmountUnformatted = delegations.reduce(
      (total, { delegation }) => total.add(delegation.balance),
      BigNumber.from(0)
    )
    amountUnformatted = amountUnformatted.add(totalDelegatedAmountUnformatted)
  }

  const refetch = () => {
    refetchDelegations()
  }
  const amount = formatUnits(amountUnformatted, ticket.decimals)
  return {
    data: {
      amount,
      amountUnformatted,
      amountPretty: numberWithCommas(amount) as string
    },
    isFetched: isDelegationsFetched,
    refetch
  }
}
