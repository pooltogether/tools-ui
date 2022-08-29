import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'

/////////////////////////////////////////////////////////////////////
// Required constants for this tool to work.
// When adding a new network to the tool, ensure these constants are updated.
// Ensure the global config includes these updates as well.
/////////////////////////////////////////////////////////////////////

export const AIRDROP_CLAIM_CHAIN_ID = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.mainnet,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.rinkeby
})

export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId: number]: string } = Object.freeze({
  [CHAIN_ID.mainnet]: '0xBE1a33519F586A4c8AA37525163Df8d67997016f',
  [CHAIN_ID.rinkeby]: '0x93a6540DcE05a4A5E5B906eB97bBCBb723768F2D'
})
