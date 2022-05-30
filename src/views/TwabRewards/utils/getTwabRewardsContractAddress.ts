import { TWAB_REWARDS_ADDRESS } from '@twabRewards/config'

export const getTwabRewardsContractAddress = (chainId: number) => TWAB_REWARDS_ADDRESS[chainId]
