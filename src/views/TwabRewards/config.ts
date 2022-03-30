import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'

/////////////////////////////////////////////////////////////////////
// Required constants for this tool to work.
// When adding a new network to the tool, ensure these constants are updated.
// Ensure the global config includes these updates as well.
/////////////////////////////////////////////////////////////////////

export const TWAB_REWARDS_DEFAULT_CHAIN_ID = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.rinkeby
})

export const TWAB_REWARDS_SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [CHAIN_ID.mainnet, CHAIN_ID.polygon, CHAIN_ID.avalanche],
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.rinkeby, CHAIN_ID.mumbai, CHAIN_ID.fuji]
})

export const TWAB_REWARDS_ADDRESS: { [chainId: number]: string } = Object.freeze({
  [CHAIN_ID.rinkeby]: '0xa912709E589c58A5F740AB6B49A035A2e4eF9b74',
  [CHAIN_ID.mumbai]: '0x18771cC0bbcA24d3B28C040669DCc7b5Ffba30FB',
  [CHAIN_ID.fuji]: '0xF567588A82660F9F93059E97063360900387a2cc',
  [CHAIN_ID.avalanche]: '0x46d2f8e4D8Ff3d76cf252D89dD9b422f04123D2c',
  [CHAIN_ID.mainnet]: '0x3Cb049Db6d3E100b8b4765Ca051C809adcC17ed1',
  [CHAIN_ID.polygon]: '0xCa9adB15E33948199066f772C3cb02B62356d764'
})
