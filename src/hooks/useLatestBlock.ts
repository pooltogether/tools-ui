import { Block } from '@ethersproject/providers'
import { NO_REFETCH } from '@pooltogether/hooks/dist/constants'
import { getReadProvider, sToMs } from '@pooltogether/utilities'
import { useQuery } from 'wagmi'

export const useLatestBlock = (chainId: number) => {
  return useQuery(
    ['useLatestBlock', chainId],
    async (): Promise<Block> => {
      const provider = getReadProvider(chainId)
      return provider.getBlock('latest')
    },
    { ...NO_REFETCH, enabled: !!chainId, refetchInterval: 18000 }
  )
}
