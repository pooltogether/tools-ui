import { PrizeTierHistoryContract } from '@prizeTierController/interfaces'
import { useQuery } from 'react-query'

export const usePrizeTierHistoryManager = (prizeTierHistoryContract: PrizeTierHistoryContract) => {
  return useQuery(['usePrizeTierHistoryManager', prizeTierHistoryContract.id], async () => {
    const manager: string = (await prizeTierHistoryContract.contract.functions.manager())[0]

    return manager
  })
}
