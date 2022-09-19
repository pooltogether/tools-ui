import { PRIZE_POOL_BY_TICKET } from '@liquidator/constants/PrizePoolsByTicket'

export const useTicketPrizePoolAddress = (chainId: number, ticketAddress: string) => {
  return PRIZE_POOL_BY_TICKET[chainId]?.[ticketAddress]
}
