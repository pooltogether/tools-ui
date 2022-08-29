import { getIsDelegationLocked } from '@twabDelegator/utils/getIsDelegationLocked'
import { useMemo } from 'react'
import { useDelegatorsTwabDelegations } from './useDelegatorsTwabDelegations'

export const useIsADelegationLocked = (chainId: number, delegator: string) => {
  const {
    data: delegations,
    isFetched,
    isFetching
  } = useDelegatorsTwabDelegations(chainId, delegator)

  return useMemo(() => {
    if (!isFetched) return null
    return delegations.some((delegation) => getIsDelegationLocked(delegation.delegation))
  }, [isFetching, isFetched])
}
