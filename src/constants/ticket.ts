import { Token } from '@pooltogether/hooks'
import { CHAIN_ID } from '@constants/misc'

export const TICKET: { [chainId: number]: Token } = Object.freeze({
  [CHAIN_ID.rinkeby]: {
    address: '0x325E456e8Ac0bCB65a5515FA70B6b9D581809c36',
    symbol: 'TICK',
    name: 'Ticket',
    decimals: '6'
  },
  [CHAIN_ID.mumbai]: {
    address: '0x34445304E2ad5418CD052E6511652a5dA80aA0aE',
    symbol: 'TICK',
    name: 'Ticket',
    decimals: '6'
  },
  [CHAIN_ID.fuji]: {
    address: '0x1758E6930fF20B56f55247b498E0a4dc01360234',
    symbol: 'TICK',
    name: 'Ticket',
    decimals: '6'
  }
})
