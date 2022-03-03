import { batch, contract } from '@pooltogether/etherplex'
import { getReadProvider } from '@pooltogether/utilities'
import { useTwabDelegatorChainIds } from '@twabDelegator/hooks/useTwabDelegatorChainIds'
import TwabDelegatorAbi from '@twabDelegator/abis/TwabDelegator'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useQueries, useQuery } from 'react-query'
import { NO_REFETCH } from '@pooltogether/hooks/dist/constants'
import { Delegation } from '@twabDelegator/interfaces'

/**
 *
 * @param chainId
 * @param usersAddress
 * @returns
 */
export const useUsersTwabDelegations = (chainId: number, usersAddress: string) => {
  return useQuery(
    ['useUsersTwabDelegations', usersAddress, chainId],
    async () => getUsersTwabDelegations(chainId, usersAddress),
    {
      ...NO_REFETCH,
      enabled: !!usersAddress
    }
  )
}

/**
 *
 * @param chainId
 * @param usersAddress
 * @returns
 */
const getUsersTwabDelegations = async (chainId: number, usersAddress: string) => {
  const provider = getReadProvider(chainId)
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)

  const pageSize = 10
  let slotIndexOffset = 0
  let batchCalls = []

  const delegations: {
    [slotIndex: string]: Delegation
  } = {}

  const fetchPageOfTwabDelegations = async () => {
    for (let i = 0; i < slotIndexOffset + pageSize; i++) {
      const slotIndex = i + slotIndexOffset
      const twabDelegatorContract = contract(
        slotIndex.toString(),
        TwabDelegatorAbi,
        twabDelegatorAddress
      )
      batchCalls.push(twabDelegatorContract.getDelegation(usersAddress, slotIndex))
    }

    let response = await batch(provider, ...batchCalls)
    const slotIndices = Object.keys(response)

    slotIndices.forEach((slotIndex) => {
      const delegation: Delegation = response[slotIndex].getDelegation
      if (delegation.wasCreated) {
        delegations[slotIndex] = delegation
      }
    })

    // If the highest slot was filled, fetch another page. Otherwise, assume there are no more filled slots.
    const lastSlotIndex = slotIndexOffset + pageSize - 1
    const lastDelegationInPage: Delegation = response[lastSlotIndex].getDelegation
    if (lastDelegationInPage.wasCreated) {
      slotIndexOffset += pageSize
      await fetchPageOfTwabDelegations()
    }
  }

  await fetchPageOfTwabDelegations()
  console.log({ chainId, delegations })
  return delegations
}
