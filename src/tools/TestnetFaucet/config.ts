import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'

/////////////////////////////////////////////////////////////////////
// Required constants for this tool to work.
// When adding a new network to the tool, ensure these constants are updated.
// Ensure the global config includes these updates as well.
/////////////////////////////////////////////////////////////////////

export const FAUCET_DEFAULT_CHAIN_ID = Object.freeze({
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.rinkeby
})

export const FAUCET_SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.rinkeby]
})

export const FAUCET_ADDRESS: { [chainId: number]: string } = Object.freeze({
  [CHAIN_ID.rinkeby]: '0xd5D322390aD95C644c99d6A5Badd7c2EB5AfC712'
})

export const TOKEN_ADDRESSES: { [chainId: number]: string[] } = Object.freeze({
  [CHAIN_ID.rinkeby]: [
    '0xcd186Dc42eE0EFc756D5b3c1bab77669b3f25781',
    '0xBcdE4bf4F130299396ad4618473F04d2A91a950C',
    '0x1F6582E3417c0Aba2f6fc75Ec7b5119e90197a78',
    '0xBC8A19D2f528485e9A3754F9E87Af10eFa6032f2'
  ]
})
