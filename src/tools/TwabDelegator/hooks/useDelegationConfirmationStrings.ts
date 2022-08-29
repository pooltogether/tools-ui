import { useV4Ticket } from '@hooks/v4/useV4Ticket'
import { sToD } from '@pooltogether/utilities'
import {
  delegationCreationsAtom,
  delegationFundsAtom,
  delegationUpdatesAtom,
  delegationWithdrawalsAtom
} from '@twabDelegator/atoms'
import { formatUnits } from 'ethers/lib/utils'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'

/**
 * // TODO: Make this more efficient.
 * @param chainId
 * @param delegator
 * @returns
 */
export const useDelegationConfirmationStrings = (chainId: number, delegator: string) => {
  const ticket = useV4Ticket(chainId)
  const { data: delegationData, isFetched } = useDelegatorsTwabDelegations(chainId, delegator)
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  const [delegationCreations] = useAtom(delegationCreationsAtom)
  const [delegationFunds] = useAtom(delegationFundsAtom)
  const [delegationWithdrawals] = useAtom(delegationWithdrawalsAtom)

  return useMemo(() => {
    if (!isFetched) {
      return null
    }

    const updateStrings: string[] = []

    // Check delegation creations
    delegationCreations.forEach((delegationCreation) => {
      const slot = delegationCreation.slot.toString()
      // Check for delegatee update
      updateStrings.push(
        `Create delegation #${slot} with delegatee ${delegationCreation.delegatee}`
      )
    })

    // Check delegation updates
    delegationUpdates.forEach((delegationUpdate) => {
      const slot = delegationUpdate.slot.toString()

      const delegation = delegationData.find(
        (delegationData) =>
          delegationUpdate.delegator === delegationData.delegationId.delegator &&
          delegationUpdate.slot.eq(delegationData.delegationId.slot)
      )

      // Check for delegatee update
      if (delegationUpdate.delegatee !== delegation.delegation.delegatee) {
        updateStrings.push(`Update slot #${slot} delegatee to ${delegationUpdate.delegatee}`)
      }

      // Check for lock durations
      if (delegationUpdate.lockDuration) {
        updateStrings.push(`Set slot #${slot} lock to ${sToD(delegationUpdate.lockDuration)} days`)
      }
    })

    // Check delegation funds
    delegationFunds.forEach((delegationFund) => {
      const slot = delegationFund.slot.toString()

      const delegation = delegationData.find(
        (delegationData) =>
          delegationFund.delegator === delegationData.delegationId.delegator &&
          delegationFund.slot.eq(delegationData.delegationId.slot)
      )

      // Check for fund change or initialization
      if (delegation) {
        updateStrings.push(
          `Update slot #${slot} balance to ${formatUnits(delegationFund.amount, ticket.decimals)} ${
            ticket.symbol
          }`
        )
      } else {
        updateStrings.push(
          `Fund slot #${slot} with ${formatUnits(delegationFund.amount, ticket.decimals)} ${
            ticket.symbol
          }`
        )
      }
    })

    // Check delegation withdrawals
    delegationWithdrawals.forEach((delegationWithdrawal) => {
      const slot = delegationWithdrawal.slot.toString()

      const delegation = delegationData.find(
        (delegationData) =>
          delegationWithdrawal.delegator === delegationData.delegationId.delegator &&
          delegationWithdrawal.slot.eq(delegationData.delegationId.slot)
      )

      updateStrings.push(
        `Withdraw ${formatUnits(delegation.delegation.balance, 6)} USDC from slot #${slot}`
      )
    })

    return updateStrings
  }, [isFetched, delegationUpdates, delegationCreations, delegationFunds, delegationWithdrawals])
}
