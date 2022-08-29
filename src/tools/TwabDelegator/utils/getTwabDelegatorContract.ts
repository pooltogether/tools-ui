import { contract, MulticallContract } from '@pooltogether/etherplex'
import { Contract, ethers } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'

import TwabDelegatorAbi from '@twabDelegator/abis/TwabDelegator'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'
import { RPC_API_KEYS } from '@constants/config'

export const getTwabDelegatorContract = (
  chainId: number,
  _providerOrSigner?: Provider | Signer
): Contract => {
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId, RPC_API_KEYS)
  return new ethers.Contract(twabDelegatorAddress, TwabDelegatorAbi, providerOrSigner)
}

export const getTwabDelegatorEtherplexContract = (chainId: number): MulticallContract => {
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  return contract(twabDelegatorAddress, TwabDelegatorAbi, twabDelegatorAddress)
}
