import { LIQUIDATOR_ADDRESS } from '@liquidator/config'

export const useLiquidatorAddress = (chainId: number) => LIQUIDATOR_ADDRESS[chainId]
