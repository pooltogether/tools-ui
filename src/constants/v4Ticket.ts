import { Token } from '@pooltogether/hooks'
import { CHAIN_ID } from '@constants/misc'

export const V4_TICKET: { [chainId: number]: Token } = Object.freeze({
  [CHAIN_ID.optimism]: {
    address: '0x62BB4fc73094c83B5e952C2180B23fA7054954c4',
    symbol: 'PTaOptUSDC',
    name: 'PoolTogether aOptUSDC Ticket',
    decimals: '6'
  },
  [CHAIN_ID.polygon]: {
    address: '0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076',
    symbol: 'PTaUSDC',
    name: 'PoolTogether aUSDC Ticket',
    decimals: '6'
  },
  [CHAIN_ID.mainnet]: {
    address: '0xdd4d117723C257CEe402285D3aCF218E9A8236E1',
    symbol: 'PTaUSDC',
    name: 'PoolTogether aUSDC Ticket',
    decimals: '6'
  },
  [CHAIN_ID.avalanche]: {
    address: '0xB27f379C050f6eD0973A01667458af6eCeBc1d90',
    symbol: 'PTavUSDCe',
    name: 'PoolTogether avUSDCe Ticket',
    decimals: '6'
  },
  [CHAIN_ID['optimism-kovan']]: {
    address: '0xF567588A82660F9F93059E97063360900387a2cc',
    symbol: 'TICK',
    name: 'Ticket',
    decimals: '6'
  },
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
