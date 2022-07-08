import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'

/////////////////////////////////////////////////////////////////////
// Required constants for this tool to work.
// When adding a new network to the tool, ensure these constants are updated.
// Ensure the global config includes these updates as well.
/////////////////////////////////////////////////////////////////////

export const TWAB_DELEGATOR_DEFAULT_CHAIN_ID = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.rinkeby
})

export const TWAB_DELEGATOR_SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [
    CHAIN_ID.mainnet,
    CHAIN_ID.polygon,
    CHAIN_ID.avalanche,
    CHAIN_ID.optimism
  ],
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.rinkeby, CHAIN_ID.mumbai, CHAIN_ID.fuji]
})

export const TWAB_DELEGATOR_ADDRESS: { [chainId: number]: string } = Object.freeze({
  [CHAIN_ID.rinkeby]: '0x448200d83e48f561B42e90274566d3FA3914B8A4',
  [CHAIN_ID.mumbai]: '0xaAc4688AB7AD2c0CbC51E9674D53Bf394910aF6a',
  [CHAIN_ID.fuji]: '0xdB4B551C21860028c4CA951CC7067699eB7c5Bfe',
  [CHAIN_ID.avalanche]: '0xd23723fef8A16B77eaDc1fC822aE4170bA9d4009',
  [CHAIN_ID.mainnet]: '0x5cFbEE38362B9A60be276763753f64245EA990F7',
  [CHAIN_ID.polygon]: '0x89Ee77Ce3F4C1b0346FF96E3004ff7C9f972dEF8',
  [CHAIN_ID.optimism]: '0x469C6F4c1AdA45EB2E251685aC2bf05aEd591E70'
})
