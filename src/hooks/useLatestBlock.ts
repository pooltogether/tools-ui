import { Block } from '@ethersproject/providers'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { useQuery } from 'react-query'

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
