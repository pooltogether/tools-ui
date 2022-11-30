import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'

/////////////////////////////////////////////////////////////////////
// Required constants for this tool to work.
// When adding a new network to the tool, ensure these constants are updated.
// Ensure the global config includes these updates as well.
/////////////////////////////////////////////////////////////////////

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

export const PRIZE_TIER_HISTORY_V1: { [chainId: number]: { address: string; token: string } } =
  Object.freeze({
    [CHAIN_ID.optimism]: { address: '0xC88f04D5D00367Ecd016228302a1eACFaB164DBA', token: 'USDC' },
    [CHAIN_ID.polygon]: { address: '0x1DcaD946D10343cc4494D610d6273153FB071772', token: 'USDC' },
    [CHAIN_ID.mainnet]: { address: '0x24C3e15BdC10Ce2CB1BEc56cd43F397cE9B89430', token: 'USDC' },
    [CHAIN_ID.avalanche]: { address: '0xC3DAD539E460103c860Bb9Ca547647EDbD4903b6', token: 'USDC' },
    [CHAIN_ID['optimism-goerli']]: {
      address: '0xF567588A82660F9F93059E97063360900387a2cc',
      token: 'USDC'
    },
    [CHAIN_ID['arbitrum-goerli']]: {
      address: '0x6A501383A61ebFBc143Fc4BD41A2356bA71A6964',
      token: 'USDC'
    },
    [CHAIN_ID.mumbai]: { address: '0x0450Be4f1e986Ef22D01d00d75dcb593E6840057', token: 'TOK' },
    [CHAIN_ID.goerli]: { address: '0xF567588A82660F9F93059E97063360900387a2cc', token: 'USDC' },
    [CHAIN_ID.fuji]: { address: '0x145d38344fb8d35606b221F513d2BaEa2691c029', token: 'TOK' }
  })

// export const PRIZE_TIER_HISTORY_V2: { [chainId: number]: { address: string; token: string } } =
//   Object.freeze({
//     [CHAIN_ID.optimism]: { address: '', token: 'USDC' },
//     [CHAIN_ID.polygon]: { address: '', token: 'USDC' },
//     [CHAIN_ID.mainnet]: { address: '', token: 'USDC' },
//     [CHAIN_ID.avalanche]: { address: '', token: 'USDC' },
//     [CHAIN_ID['optimism-goerli']]: {
//       address: '',
//       token: 'USDC'
//     },
//     [CHAIN_ID['arbitrum-goerli']]: {
//       address: '',
//       token: 'USDC'
//     },
//     [CHAIN_ID.mumbai]: { address: '', token: 'TOK' },
//     [CHAIN_ID.goerli]: { address: '', token: 'USDC' },
//     [CHAIN_ID.fuji]: { address: '', token: 'TOK' }
//   })

export const TOKEN_INFO: {
  [token: string]: { [chainId: number]: { address: string; decimals: number } }
} = Object.freeze({
  USDC: {
    [CHAIN_ID.optimism]: { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6 },
    [CHAIN_ID.polygon]: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
    [CHAIN_ID.mainnet]: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    [CHAIN_ID.avalanche]: { address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', decimals: 6 },
    [CHAIN_ID['optimism-goerli']]: {
      address: '0xf1485Aa729DF94083ab61B2C65EeA99894Aabdb3',
      decimals: 6
    },
    [CHAIN_ID['arbitrum-goerli']]: {
      address: '0x6775842AE82BF2F0f987b10526768Ad89d79536E',
      decimals: 6
    },
    [CHAIN_ID.mumbai]: { address: '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747', decimals: 6 },
    [CHAIN_ID.goerli]: { address: '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43', decimals: 6 }
  },
  TOK: {
    [CHAIN_ID.mumbai]: { address: '0xD297F7BCF6c030EBBFD0331a8a7C3a92cB45A8a2', decimals: 6 },
    [CHAIN_ID.fuji]: { address: '0x555796ADdc9f9Ee8861b31d12615E0cb49A9Be2F', decimals: 6 }
  }
})
