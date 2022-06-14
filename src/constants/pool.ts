import { Token } from '@pooltogether/hooks'
import { CHAIN_ID } from '@pooltogether/wallet-connection'

export const POOL: { [chainId: number]: Token } = Object.freeze({
  [CHAIN_ID.rinkeby]: {
    address: '0xcd186Dc42eE0EFc756D5b3c1bab77669b3f25781',
    symbol: 'POOL',
    name: 'POOL Token',
    decimals: '18'
  }
})
