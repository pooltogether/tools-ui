import { Token } from '@pooltogether/hooks'
import { CHAIN_ID } from '@pooltogether/wallet-connection'

export const PRIZE_POOL_BY_TICKET: { [chainId: number]: { [ticketAddress: string]: string } } =
  Object.freeze({
    [CHAIN_ID.rinkeby]: {
      '0x485cb32f8e7159feebf98e19d0f9b2dc7348ac77': '0x4312EB619A17f39607BB3933Fc265c88767D528B',
      '0x22D7D499D13eE75210A0F3215A2D8942B5B233b4': '0xD384DBD1E76d65E5B08e5732Dc82684922Bf5eBc',
      '0x95448a041d34241177b375a65efb34c61ad9e2b3': '0x5adE49A86ce632B34F8bd890afA50ebc09560311'
    }
  })
