import { TWAB_DELEGATOR_ADDRESS } from '@twabDelegator/constants'

export const getTwabDelegatorContractAddress = (chainId: number) => TWAB_DELEGATOR_ADDRESS[chainId]
