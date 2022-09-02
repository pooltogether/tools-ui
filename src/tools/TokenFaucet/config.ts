import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'

/////////////////////////////////////////////////////////////////////
// Required constants for this tool to work.
// When adding a new network to the tool, ensure these constants are updated.
// Ensure the global config includes these updates as well.
/////////////////////////////////////////////////////////////////////

export const TOKEN_FAUCET_DEFAULT_CHAIN_ID = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.mainnet,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.rinkeby
})

export const TOKEN_FAUCET_SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [CHAIN_ID.polygon, CHAIN_ID.mainnet, CHAIN_ID.celo],
  [APP_ENVIRONMENTS.testnets]: [
    CHAIN_ID['optimism-kovan'],
    CHAIN_ID.mumbai,
    CHAIN_ID.rinkeby,
    CHAIN_ID.fuji
  ]
})

export const TOKEN_FAUCET_ADDRESSES: { [chainId: number]: string[] } = Object.freeze({
  [CHAIN_ID.polygon]: [
    '0x90a8d8ee6fdb1875028c6537877e6704b2646c51',
    '0x951A969324127Fcc19D3498d6954A296E3B9C33c',
    '0x12533c9fe479ab8c27e55c1b7697e0647fadb153',
    '0x6cbc003fe015d753180f072d904ba841b2415498'
  ],
  [CHAIN_ID.mainnet]: [
    '0xf362ce295f2a4eae4348ffc8cdbce8d729ccb8eb',
    '0xa5dddefd30e234be2ac6fc1a0364cfd337aa0f61',
    '0xbd537257fad96e977b9e545be583bbf7028f30b9',
    '0x30430419b86e9512e6d93fc2b0791d98dbeb637b',
    '0x72f06a78bbaac0489067a1973b0cef61841d58bc',
    '0x40f76363129118b34cc2af44963192c3e8690ba6',
    '0xddcf915656471b7c44217fb8c51f9888701e759a',
    '0xd186302304fd367488b5087af5b12cb9b7cf7540',
    '0x9a29401ef1856b669f55ae5b24505b3b6faeb370'
  ],
  [CHAIN_ID.celo]: [
    '0xc777e1db58c386b8827bc1321fc2fef03ee5a7b7',
    '0xd7bb81038d60e3530b9d550cd17de605bd27b937'
  ],
  [CHAIN_ID['optimism-kovan']]: [],
  [CHAIN_ID.mumbai]: [],
  [CHAIN_ID.rinkeby]: [
    '0x5d5af77cf99f7015e615f9b3286a27c5b6090707',
    '0x97b99693613aaa74a3fa0b2f05378b8f6a74a893'
  ],
  [CHAIN_ID.fuji]: []
})
