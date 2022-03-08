import { TICKET } from '@constants/ticket'

export const getTicketContractAddress = (chainId: number) => TICKET[chainId]?.address
