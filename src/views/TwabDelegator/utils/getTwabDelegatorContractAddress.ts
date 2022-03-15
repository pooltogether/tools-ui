import { TWAB_DELEGATOR_ADDRESS } from '@twabDelegator/config'

export const getTwabDelegatorContractAddress = (chainId: number) => TWAB_DELEGATOR_ADDRESS[chainId]
