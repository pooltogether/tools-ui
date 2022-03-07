import { delegationCreationsAtom } from '@twabDelegator/atoms'
import { BigNumber } from 'ethers'
import { useAtom } from 'jotai'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'

/**
 * Finds the largest slot being used and returns the next index.
 * @param chainId
 * @param delegator
 * @returns
 */
export const useNextSlot = (chainId: number, delegator: string) => {
  const { data, isFetched } = useDelegatorsTwabDelegations(chainId, delegator)
  const [delegationCreations] = useAtom(delegationCreationsAtom)
  if (!isFetched) return null
  const largestSlotInCreations = delegationCreations.reduce(
    (currentLargestSlot, delegationUpdate) => {
      return currentLargestSlot.gt(delegationUpdate.slot)
        ? currentLargestSlot
        : delegationUpdate.slot
    },
    BigNumber.from(0)
  )
  const largestSlotInDelegations = data.reduce((currentLargestSlot, currentDelegationWithId) => {
    return currentLargestSlot.gt(currentDelegationWithId.delegationId.slot)
      ? currentLargestSlot
      : currentDelegationWithId.delegationId.slot
  }, BigNumber.from(0))
  const largestSlot = largestSlotInCreations.gt(largestSlotInDelegations)
    ? largestSlotInCreations
    : largestSlotInDelegations
  return largestSlot.add(1)
}
