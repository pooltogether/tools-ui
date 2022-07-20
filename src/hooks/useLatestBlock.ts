import { Block } from '@ethersproject/providers'
import { getReadProvider } from '@pooltogether/utilities'
import { useQuery } from 'wagmi'

export const useLatestBlock = (chainId: number) => {
  return useQuery(
    ['useLatestBlock', chainId],
    async (): Promise<Block> => {
      const provider = getReadProvider(chainId)
      return provider.getBlock('latest')
    },
    { enabled: !!chainId, refetchInterval: 18000 }
  )
}
