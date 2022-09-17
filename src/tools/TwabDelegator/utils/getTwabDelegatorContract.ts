import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'
import { contract, MulticallContract } from '@pooltogether/etherplex'
import { getReadProvider } from '@pooltogether/wallet-connection'
import TwabDelegatorAbi from '@twabDelegator/abis/TwabDelegator'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { Contract, ethers } from 'ethers'

export const getTwabDelegatorContract = (
  chainId: number,
  _providerOrSigner?: Provider | Signer
): Contract => {
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId)
  return new ethers.Contract(twabDelegatorAddress, TwabDelegatorAbi, providerOrSigner)
}

export const getTwabDelegatorEtherplexContract = (chainId: number): MulticallContract => {
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  return contract(twabDelegatorAddress, TwabDelegatorAbi, twabDelegatorAddress)
}
