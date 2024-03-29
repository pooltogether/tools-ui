import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'
import { contract, MulticallContract } from '@pooltogether/etherplex'
import { getReadProvider } from '@pooltogether/wallet-connection'
import TwabRewardsAbi from '@twabRewards/abis/TwabRewards'
import { getTwabRewardsContractAddress } from '@twabRewards/utils/getTwabRewardsContractAddress'
import { Contract, ethers } from 'ethers'

export const getTwabRewardsContract = (
  chainId: number,
  _providerOrSigner?: Provider | Signer
): Contract => {
  const twabRewardsAddress = getTwabRewardsContractAddress(chainId)
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId)
  return new ethers.Contract(twabRewardsAddress, TwabRewardsAbi, providerOrSigner)
}

export const getTwabRewardsEtherplexContract = (chainId: number): MulticallContract => {
  const twabRewardsAddress = getTwabRewardsContractAddress(chainId)
  return contract(twabRewardsAddress, TwabRewardsAbi, twabRewardsAddress)
}
