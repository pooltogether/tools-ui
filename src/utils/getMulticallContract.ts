import { Contract, ethers } from 'ethers'
import { BaseProvider } from '@ethersproject/providers'
import { Signer } from '@ethersproject/abstract-signer'
import MulticallAbi from '@abis/Multicall'
import { getMulticallContractAddress } from '@utils/getMulticallContractAddress'
import { getReadProvider } from '@pooltogether/wallet-connection'

export const getMulticallContract = (
  chainId: number,
  _providerOrSigner?: BaseProvider | Signer
): Contract => {
  const multicallAddress = getMulticallContractAddress(chainId)
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId)
  return new ethers.Contract(multicallAddress, MulticallAbi, providerOrSigner)
}
