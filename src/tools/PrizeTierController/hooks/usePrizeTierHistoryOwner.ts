import { PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryOwner = (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  return useQuery(['usePrizeTierHistoryOwner', prizeTierHistoryContract.id], async () => {
    const owner: string = (await prizeTierHistoryContract.contract.functions.owner())[0]

    return owner
  })
}
