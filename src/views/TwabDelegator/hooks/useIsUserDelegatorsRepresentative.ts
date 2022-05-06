import { useQuery } from 'react-query'
import { getTwabDelegatorContract } from '@twabDelegator/utils/getTwabDelegatorContract'

export const useIsUserDelegatorsRepresentative = (
  chainId: number,
  usersAddress: string,
  delegator: string
) => {
  return useQuery(
    ['useIsUserDelegatorsRepresentative', chainId, usersAddress, delegator],
    async () => getUsersRepresentative(chainId, usersAddress, delegator),
    {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      enabled: !!usersAddress && !!delegator
    }
  )
}

const getUsersRepresentative = async (chainId: number, usersAddress: string, delegator: string) => {
  const twabDelegatorContract = getTwabDelegatorContract(chainId)
  console.log({ twabDelegatorContract, chainId, usersAddress, delegator })
  const response = await twabDelegatorContract.functions.isRepresentativeOf(delegator, usersAddress)
  console.log({ response })
  return response[0]
}
