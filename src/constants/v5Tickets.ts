import { Token } from '@pooltogether/hooks'
import { CHAIN_ID } from '@pooltogether/wallet-connection'

export const V5_TICKETS: { [chainId: number]: Token[] } = Object.freeze({
  [CHAIN_ID.rinkeby]: [
    {
      address: '0x22D7D499D13eE75210A0F3215A2D8942B5B233b4',
      symbol: 'PTaUSDC15',
      name: 'PoolTogether aUSDC Ticket 15% APY',
      decimals: '6'
    },
    {
      address: '0x485cb32f8e7159feebf98e19d0f9b2dc7348ac77',
      symbol: 'PTaDAI10',
      name: 'PoolTogether aDAI Ticket 10% APY',
      decimals: '18'
    },
    {
      address: '0x95448a041d34241177b375a65efb34c61ad9e2b3',
      symbol: 'PTaUSDC5',
      name: 'PoolTogether aUSDC Ticket 5% APY',
      decimals: '6'
    }
  ]
})
