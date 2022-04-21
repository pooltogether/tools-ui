import { Contract, ethers } from 'ethers'
import { BaseProvider } from '@ethersproject/providers'
import { Signer } from '@ethersproject/abstract-signer'

import MulticallAbi from '@abis/Multicall'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { getMulticallContractAddress } from '@utils/getMulticallContractAddress'
import { RPC_API_KEYS } from '@constants/config'

export const getMulticallContract = (
  chainId: number,
  _providerOrSigner?: BaseProvider | Signer
): Contract => {
  const multicallAddress = getMulticallContractAddress(chainId)
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId, RPC_API_KEYS)
  return new ethers.Contract(multicallAddress, MulticallAbi, providerOrSigner)
}
