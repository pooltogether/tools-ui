import {
  delegationCreationsAtom,
  delegationFundsAtom,
  delegationUpdatesAtom
} from '@twabDelegator/atoms'
import {
  Delegation,
  DelegationFund,
  DelegationId,
  DelegationUpdate
} from '@twabDelegator/interfaces'
import { useAtom } from 'jotai'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'

/**
 * // TODO: Make this more efficient.
 * @param chainId
 * @param delegator
 * @returns
 */
export const useDelegatorsUpdatedTwabDelegations = (chainId: number, delegator: string) => {
  const useQueryResult = useDelegatorsTwabDelegations(chainId, delegator)
  const [delegationUpdates] = useAtom(delegationUpdatesAtom)
  const [delegationCreations] = useAtom(delegationCreationsAtom)
  const [delegationFunds] = useAtom(delegationFundsAtom)

  if (!useQueryResult.isFetched) {
    return {
      ...useQueryResult,
      data: null
    }
  }

  const data: {
    delegationId: DelegationId
    delegation?: Delegation
    delegationUpdate?: DelegationUpdate
    delegationCreation?: DelegationUpdate
    delegationFund?: DelegationFund
  }[] = useQueryResult.data.map((delegationWithId) => {
    const { delegation, delegationId } = delegationWithId
    const delegationUpdate = delegationUpdates.find(
      (delegationUpdate) =>
        delegationUpdate.delegator === delegationId.delegator &&
        delegationUpdate.slot.eq(delegationId.slot)
    )
    const delegationFund = delegationFunds.find(
      (delegationFund) =>
        delegationFund.delegator === delegationId.delegator &&
        delegationFund.slot.eq(delegationId.slot)
    )
    const delegationCreation = delegationCreations.find(
      (delegationCreation) =>
        delegationCreation.delegator === delegationId.delegator &&
        delegationCreation.slot.eq(delegationId.slot)
    )
    return {
      delegation,
      delegationId,
      delegationUpdate,
      delegationCreation,
      delegationFund
    }
  })

  // Add in delegation creations if they aren't there
  delegationCreations.forEach((delegationCreation) => {
    const isAdded = data.some(
      (delegationData) => delegationData.delegationCreation === delegationCreation
    )
    if (!isAdded) {
      const delegationFund = delegationFunds.find(
        (delegationFund) =>
          delegationFund.delegator === delegationCreation.delegator &&
          delegationFund.slot.eq(delegationCreation.slot)
      )
      data.push({
        delegationId: {
          slot: delegationCreation.slot,
          delegator: delegationCreation.delegator
        },
        delegationCreation: delegationCreation,
        delegationFund
      })
    }
  })

  data.sort((a, b) => (a.delegationId.slot.gt(b.delegationId.slot) ? 1 : -1))

  return {
    ...useQueryResult,
    data
  }
}
