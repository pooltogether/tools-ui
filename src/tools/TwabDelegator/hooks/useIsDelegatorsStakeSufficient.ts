import { useTokenBalance } from '@pooltogether/hooks'
import { delegationFundsAtom } from '@twabDelegator/atoms'
import { DelegationFund } from '@twabDelegator/interfaces'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useAtom } from 'jotai'
import { useDelegationUpdatesNetDifference } from './useDelegationUpdatesNetDifference'
import { useIsAmountSufficientForFunds } from './useIsAmountSufficientForFunds'

/**
 * Fetches the delegators staked balances and checks if it is greater than the amount of tickets the user has committed to delegating while updating their delegations
 * @param chainId
 * @param delegator
 * @returns
 */
export const useIsDelegatorsStakeSufficient = (
  chainId: number,
  delegator: string,
  delegationFunds: DelegationFund[]
) => {
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const { data: stakeBalance } = useTokenBalance(chainId, delegator, twabDelegatorAddress)
  return useIsAmountSufficientForFunds(
    chainId,
    delegator,
    stakeBalance?.amountUnformatted,
    delegationFunds
  )
}
