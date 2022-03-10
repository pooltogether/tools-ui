import { TICKET } from '@constants/ticket'

// TODO: Will need to expand this to also look for the right prize pool on that chain when we have multiple prize pools per chain.
export const useTicket = (chainId: number) => TICKET[chainId]
