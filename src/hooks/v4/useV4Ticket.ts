import { V4_TICKET } from '@constants/v4Ticket'

// TODO: Will need to expand this to also look for the right prize pool on that chain when we have multiple prize pools per chain.
export const useV4Ticket = (chainId: number) => V4_TICKET[chainId]
