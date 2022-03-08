import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS, Token } from '@pooltogether/hooks'

export const TWAB_DELEGATOR_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [],
  [APP_ENVIRONMENTS.testnets]: [CHAIN_ID.rinkeby, CHAIN_ID.mumbai, CHAIN_ID.fuji]
})

export const TWAB_DELEGATOR_ADDRESS: { [chainId: number]: string } = Object.freeze({
  [CHAIN_ID.rinkeby]: '0x1CfD2f0c5DF462A58530581dD238de8E825328c3',
  [CHAIN_ID.mumbai]: '0xa1d913940B8dbb7bDB1F68D8E9C54484D575FefC',
  [CHAIN_ID.fuji]: '0x02aCC9594161812E3004C174CF1735EdB10e20A4'
})
