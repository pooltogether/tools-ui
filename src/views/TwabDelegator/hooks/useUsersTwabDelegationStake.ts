import { batch, contract } from '@pooltogether/etherplex'
import { getReadProvider } from '@pooltogether/utilities'
import { useTwabDelegatorChainIds } from '@twabDelegator/hooks/useTwabDelegatorChainIds'
import TwabDelegatorAbi from '@twabDelegator/abis/TwabDelegator'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { useQueries, useQuery } from 'react-query'
import { NO_REFETCH } from '@pooltogether/hooks/dist/constants'
import { Delegation } from '@twabDelegator/interfaces'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'

/**
 *
 * @param chainId
 * @param usersAddress
 * @returns
 */
export const useUsersTwabDelegationStake = (chainId: number, usersAddress: string) => {
  return useQuery(
    ['useUsersTwabDelegationStake', usersAddress, chainId],
    async () => getUsersTwabDelegationStake(chainId, usersAddress),
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
const getUsersTwabDelegationStake = async (chainId: number, usersAddress: string) => {
  const provider = getReadProvider(chainId)
  const twabDelegatorContract = getTwabDelegatorContract(chainId)
  const r = await twabDelegatorContract.functions

  // return delegations
}
