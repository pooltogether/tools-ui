import { useTokenBalance } from '@pooltogether/hooks'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useDelegationUpdatesNetDifference } from './useDelegationUpdatesNetDifference'

/**
 * Fetches the delegators staked balances and checks if it is greater than the amount of tickets the user has committed to delegating while updating their delegations
 * @param chainId
 * @param delegator
 * @returns
 */
export const useIsDelegatorsStakeSufficient = (chainId: number, delegator: string) => {
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: stakeBalance, isFetched } = useTokenBalance(
    chainId,
    delegator,
    twabDelegatorAddress
  )
  const totalDelegationAmount = useDelegationUpdatesNetDifference(chainId, delegator)

  if (!isFetched || !totalDelegationAmount) return null
  return stakeBalance.amountUnformatted.gte(totalDelegationAmount)
}
