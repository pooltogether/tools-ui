import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

/**
 * Fetches the max lock duration in seconds.
 * @param chainId
 * @returns
 */
export const useMaxLockDuration = (chainId: number) => {
  return useQuery(['useMaxLockDuration', chainId], async () => {
    const twabDelegatorContract = getTwabDelegatorContract(chainId)
    console.log({ twabDelegatorContract })
    const response = await twabDelegatorContract.functions.MAX_LOCK()
    const maxLockDurationBN: BigNumber = response[0]
    return maxLockDurationBN.toNumber()
  })
}
