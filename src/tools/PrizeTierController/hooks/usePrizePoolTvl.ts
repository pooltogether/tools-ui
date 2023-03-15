import { PrizePool } from '@pooltogether/v4-client-js'
import { formatUnits } from 'ethers/lib/utils'
import { useQuery } from 'react-query'

export const usePrizePoolTvl = (prizePool: PrizePool) => {
  return useQuery(['usePrizePoolTvl', prizePool.id()], async () => {
    const ticketData = await prizePool.getTicketData()
    const ticketSupply = await prizePool.getTicketTotalSupply()
    const tvl = Number(formatUnits(ticketSupply, parseInt(ticketData.decimals)))

    return tvl
  })
}
