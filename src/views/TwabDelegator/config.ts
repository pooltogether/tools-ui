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
  [APP_ENVIRONMENTS.mainnets]: [CHAIN_ID.mainnet, CHAIN_ID.polygon, CHAIN_ID.avalanche],
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.rinkeby, CHAIN_ID.mumbai, CHAIN_ID.fuji]
})

export const TWAB_DELEGATOR_ADDRESS: { [chainId: number]: string } = Object.freeze({
  [CHAIN_ID.rinkeby]: '0x1CfD2f0c5DF462A58530581dD238de8E825328c3',
  [CHAIN_ID.mumbai]: '0xa1d913940B8dbb7bDB1F68D8E9C54484D575FefC',
  [CHAIN_ID.fuji]: '0x02aCC9594161812E3004C174CF1735EdB10e20A4'
})
