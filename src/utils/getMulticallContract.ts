import { Contract, ethers } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'

import MulticallAbi from '@abis/Multicall'
import { getReadProvider } from '@pooltogether/utilities'
import { getMulticallContractAddress } from '@utils/getMulticallContractAddress'

export const getMulticallContract = (
  chainId: number,
  _providerOrSigner?: Provider | Signer
): Contract => {
  const multicallAddress = getMulticallContractAddress(chainId)
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId)
  return new ethers.Contract(multicallAddress, MulticallAbi, providerOrSigner)
}
