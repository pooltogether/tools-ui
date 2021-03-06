import { batch, contract } from '@pooltogether/etherplex'
import { getReadProvider } from '@pooltogether/wallet-connection'
import TwabDelegatorAbi from '@twabDelegator/abis/TwabDelegator'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useQuery } from 'react-query'
import { Delegation, DelegationId } from '@twabDelegator/interfaces'
import { BigNumber } from 'ethers'
import { RPC_API_KEYS } from '@constants/config'

/**
 *
 * @param chainId
 * @param delegator
 * @returns
 */
export const useDelegatorsTwabDelegations = (chainId: number, delegator: string) => {
  return useQuery(
    ['useDelegatorsTwabDelegations', delegator, chainId],
    async () => getUsersTwabDelegationsWithIds(chainId, delegator),
    {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      enabled: !!delegator
    }
  )
}

/**
 * TODO: One day this will blow up if someone delegates to more than the max value of a js number...
 * @param chainId
 * @param delegator
 * @returns
 */
const getUsersTwabDelegationsWithIds = async (chainId: number, delegator: string) => {
  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)

  const pageSize = 10
  let slotIndexOffset = 0
  let batchCalls = []

  const delegationsWithIds: { delegation: Delegation; delegationId: DelegationId }[] = []

  const fetchPageOfTwabDelegations = async () => {
    for (let i = 0; i < slotIndexOffset + pageSize; i++) {
      const slotIndex = i + slotIndexOffset
      const twabDelegatorContract = contract(
        slotIndex.toString(),
        TwabDelegatorAbi,
        twabDelegatorAddress
      )
      batchCalls.push(twabDelegatorContract.getDelegation(delegator, slotIndex))
    }

    let response = await batch(provider, ...batchCalls)
    batchCalls = []
    const slotIndices = Object.keys(response)

    slotIndices.forEach((slotIndex) => {
      const delegationResponse: Delegation = response[slotIndex].getDelegation
      const delegation = {
        balance: delegationResponse.balance,
        delegatee: delegationResponse.delegatee,
        delegation: delegationResponse.delegation,
        length: delegationResponse.length,
        lockUntil: delegationResponse.lockUntil,
        wasCreated: delegationResponse.wasCreated
      }
      if (delegation.wasCreated) {
        delegationsWithIds.push({
          delegation,
          delegationId: {
            slot: BigNumber.from(slotIndex),
            delegator
          }
        })
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
  return delegationsWithIds
}
