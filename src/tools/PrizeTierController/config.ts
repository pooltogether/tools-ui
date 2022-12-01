import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS, Token } from '@pooltogether/hooks'

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

export const PRIZE_TIER_HISTORY_V1: {
  [chainId: number]: { address: string; tokenAddress: string }
} = Object.freeze({
  [CHAIN_ID.optimism]: {
    address: '0xC88f04D5D00367Ecd016228302a1eACFaB164DBA',
    tokenAddress: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'
  },
  [CHAIN_ID.polygon]: {
    address: '0x1DcaD946D10343cc4494D610d6273153FB071772',
    tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
  },
  [CHAIN_ID.mainnet]: {
    address: '0x24C3e15BdC10Ce2CB1BEc56cd43F397cE9B89430',
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  [CHAIN_ID.avalanche]: {
    address: '0xC3DAD539E460103c860Bb9Ca547647EDbD4903b6',
    tokenAddress: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664'
  },
  [CHAIN_ID['optimism-goerli']]: {
    address: '0xF567588A82660F9F93059E97063360900387a2cc',
    tokenAddress: '0xf1485Aa729DF94083ab61B2C65EeA99894Aabdb3'
  },
  [CHAIN_ID['arbitrum-goerli']]: {
    address: '0x6A501383A61ebFBc143Fc4BD41A2356bA71A6964',
    tokenAddress: '0x6775842AE82BF2F0f987b10526768Ad89d79536E'
  },
  [CHAIN_ID.mumbai]: {
    address: '0x0450Be4f1e986Ef22D01d00d75dcb593E6840057',
    tokenAddress: '0xD297F7BCF6c030EBBFD0331a8a7C3a92cB45A8a2'
  },
  [CHAIN_ID.goerli]: {
    address: '0xF567588A82660F9F93059E97063360900387a2cc',
    tokenAddress: '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43'
  },
  [CHAIN_ID.fuji]: {
    address: '0x145d38344fb8d35606b221F513d2BaEa2691c029',
    tokenAddress: '0x555796ADdc9f9Ee8861b31d12615E0cb49A9Be2F'
  }
})

export const PRIZE_TIER_HISTORY_V2: {
  [chainId: number]: { address: string; tokenAddress: string }
} = Object.freeze({
  [CHAIN_ID.optimism]: { address: '', tokenAddress: '' },
  [CHAIN_ID.polygon]: { address: '', tokenAddress: '' },
  [CHAIN_ID.mainnet]: { address: '', tokenAddress: '' },
  [CHAIN_ID.avalanche]: { address: '', tokenAddress: '' },
  [CHAIN_ID['optimism-goerli']]: {
    address: '',
    tokenAddress: ''
  },
  [CHAIN_ID['arbitrum-goerli']]: {
    address: '',
    tokenAddress: ''
  },
  [CHAIN_ID.mumbai]: { address: '', tokenAddress: '' },
  // [CHAIN_ID.goerli]: {
  //   // TODO: REMOVE TEST DEPLOYMENT
  //   address: '0xbD243447555f6C074d4076420DbCB5515ED86b5A',
  //   tokenAddress: '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43'
  // }
  [CHAIN_ID.goerli]: { address: '', tokenAddress: '' },
  [CHAIN_ID.fuji]: { address: '', tokenAddress: '' }
})

export const PRIZE_TIER_HISTORY_TOKENS: { [chainId: number]: { [address: string]: Token } } =
  Object.freeze({
    [CHAIN_ID.optimism]: {
      '0x7F5c764cBc14f9669B88837ca1490cCa17c31607': {
        address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
        symbol: 'USDC',
        name: 'USDC',
        decimals: '6'
      }
    },
    [CHAIN_ID.polygon]: {
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': {
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        symbol: 'USDC',
        name: 'USDC',
        decimals: '6'
      }
    },
    [CHAIN_ID.mainnet]: {
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USDC',
        decimals: '6'
      }
    },
    [CHAIN_ID.avalanche]: {
      '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664': {
        address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
        symbol: 'USDC.e',
        name: 'USDC',
        decimals: '6'
      }
    },
    [CHAIN_ID['optimism-goerli']]: {
      '0xf1485Aa729DF94083ab61B2C65EeA99894Aabdb3': {
        address: '0xf1485Aa729DF94083ab61B2C65EeA99894Aabdb3',
        symbol: 'USDC',
        name: 'USDC',
        decimals: '6'
      }
    },
    [CHAIN_ID['arbitrum-goerli']]: {
      '0x6775842AE82BF2F0f987b10526768Ad89d79536E': {
        address: '0x6775842AE82BF2F0f987b10526768Ad89d79536E',
        symbol: 'USDC',
        name: 'USDC',
        decimals: '6'
      }
    },
    [CHAIN_ID.mumbai]: {
      '0xD297F7BCF6c030EBBFD0331a8a7C3a92cB45A8a2': {
        address: '0xD297F7BCF6c030EBBFD0331a8a7C3a92cB45A8a2',
        symbol: 'TOK',
        name: 'Token',
        decimals: '6'
      }
    },
    [CHAIN_ID.goerli]: {
      '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43': {
        address: '0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43',
        symbol: 'USDC',
        name: 'USDC',
        decimals: '6'
      }
    },
    [CHAIN_ID.fuji]: {
      '0x555796ADdc9f9Ee8861b31d12615E0cb49A9Be2F': {
        address: '0x555796ADdc9f9Ee8861b31d12615E0cb49A9Be2F',
        symbol: 'TOK',
        name: 'Token',
        decimals: '6'
      }
    }
  })
