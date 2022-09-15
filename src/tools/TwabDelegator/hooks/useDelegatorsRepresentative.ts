import { useQuery } from 'react-query'

/**
 *
 * @param chainId
 * @param delegator
 * @returns
 */
export const useDelegatorsRepresentative = (chainId: number, delegator: string) => {
  return useQuery(
    ['useDelegatorsRepresentative', delegator, chainId],
    async () => getUsersRepresentative(chainId, delegator),
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
 * @param chainId
 * @param delegator
 * @returns
 */
const getUsersRepresentative = async (chainId: number, delegator: string) => {
  // TODO: READ THIS FROM THE SUBGRAPH IF POSSIBLE
}

// TODO: Make this useIsUserDelegatorsRepresentative and check if wallet connected is a rep for the delegator address we're currently looking at. If so, edit is available. Otherwise, it is not. Need to ensure that edit available means only adjusting according to the stake, not the wallet balance.

// const provider = getReadProvider(chainId)
// const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)

// const twabDelegatorContract = contract(
//     twabDelegatorAddress,
//     TwabDelegatorAbi,
//     twabDelegatorAddress
// )

// const result = await twabDelegatorContract.functions.getRepresentative(delegator)
//   return result[0]
