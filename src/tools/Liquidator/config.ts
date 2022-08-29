import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'

/////////////////////////////////////////////////////////////////////
// Required constants for this tool to work.
// When adding a new network to the tool, ensure these constants are updated.
// Ensure the global config includes these updates as well.
/////////////////////////////////////////////////////////////////////

export const LIQUIDATOR_DEFAULT_CHAIN_ID = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.rinkeby
})

export const LIQUIDATOR_SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [],
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.rinkeby]
})

export const LIQUIDATOR_ADDRESS: { [chainId: number]: string } = Object.freeze({
  [CHAIN_ID.rinkeby]: '0x6075e8090B165817762C1b53bB9BF6c80a8708c3'
})
