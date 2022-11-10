import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'

/////////////////////////////////////////////////////////////////////
// Required constants for this tool to work.
// When adding a new network to the tool, ensure these constants are updated.
// Ensure the global config includes these updates as well.
/////////////////////////////////////////////////////////////////////

export const PRIZE_TIER_CONTROLLER_DEFAULT_CHAIN_ID = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.optimism,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID['optimism-goerli']
})

export const PRIZE_TIER_CONTROLLER_SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [
    CHAIN_ID.optimism,
    CHAIN_ID.polygon,
    CHAIN_ID.mainnet,
    CHAIN_ID.avalanche
  ],
  [APP_ENVIRONMENTS.testnets]: [
    CHAIN_ID['optimism-goerli'],
    CHAIN_ID['arbitrum-goerli'],
    CHAIN_ID.mumbai,
    CHAIN_ID.goerli,
    CHAIN_ID.fuji
  ]
})

export const PRIZE_TIER_HISTORY_V1: { [chainId: number]: string[] } = Object.freeze({
  [CHAIN_ID.optimism]: ['0xC88f04D5D00367Ecd016228302a1eACFaB164DBA'],
  [CHAIN_ID.polygon]: ['0x1DcaD946D10343cc4494D610d6273153FB071772'],
  [CHAIN_ID.mainnet]: ['0x24C3e15BdC10Ce2CB1BEc56cd43F397cE9B89430'],
  [CHAIN_ID.avalanche]: ['0xC3DAD539E460103c860Bb9Ca547647EDbD4903b6'],
  [CHAIN_ID['optimism-goerli']]: ['0xF567588A82660F9F93059E97063360900387a2cc'],
  [CHAIN_ID['arbitrum-goerli']]: ['0x6A501383A61ebFBc143Fc4BD41A2356bA71A6964'],
  [CHAIN_ID.mumbai]: ['0x0450Be4f1e986Ef22D01d00d75dcb593E6840057'],
  [CHAIN_ID.goerli]: ['0xF567588A82660F9F93059E97063360900387a2cc'],
  [CHAIN_ID.fuji]: ['0x145d38344fb8d35606b221F513d2BaEa2691c029']
})

export const PRIZE_TIER_HISTORY_V2: { [chainId: number]: string[] } = Object.freeze({
  [CHAIN_ID.optimism]: [''],
  [CHAIN_ID.polygon]: [''],
  [CHAIN_ID.mainnet]: [''],
  [CHAIN_ID.avalanche]: [''],
  [CHAIN_ID['optimism-goerli']]: [''],
  [CHAIN_ID.mumbai]: [''],
  [CHAIN_ID.rinkeby]: [''],
  [CHAIN_ID.fuji]: ['']
})
