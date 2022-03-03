import { contract, MulticallContract } from '@pooltogether/etherplex'
import { Contract, ethers } from 'ethers'

import TwabDelegatorAbi from '@twabDelegator/abis/TwabDelegator'
import { getReadProvider } from '@pooltogether/utilities'
import { getTwabDelegatorContractAddress } from '@twabDelegator/utils/getTwabDelegatorContractAddress'

export const getTwabDelegatorContract = (chainId: number): Contract => {
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  const provider = getReadProvider(chainId)
  return new ethers.Contract(twabDelegatorAddress, TwabDelegatorAbi, provider)
}

export const getTwabDelegatorEtherplexContract = (chainId: number): MulticallContract => {
  const twabDelegatorAddress = getTwabDelegatorContractAddress(chainId)
  return contract(twabDelegatorAddress, TwabDelegatorAbi, twabDelegatorAddress)
}
