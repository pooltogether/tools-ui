import { useIsTestnets } from '@pooltogether/hooks'
import { ContractList } from '@pooltogether/v4-client-js'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'

export const useContractList = (): ContractList => {
  const { isTestnets } = useIsTestnets()
  return isTestnets ? (testnet as ContractList) : (mainnet as ContractList)
}
