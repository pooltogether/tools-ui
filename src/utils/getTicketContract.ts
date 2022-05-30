import { Contract, ethers } from 'ethers'
import { BaseProvider } from '@ethersproject/providers'
import { Signer } from '@ethersproject/abstract-signer'

import TicketAbi from '@abis/Ticket'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { getTicketContractAddress } from '@utils/getTicketContractAddress'
import { RPC_API_KEYS } from '@constants/config'

export const getTicketContract = (
  chainId: number,
  _providerOrSigner?: BaseProvider | Signer
): Contract => {
  const ticketAddress = getTicketContractAddress(chainId)
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId, RPC_API_KEYS)
  return new ethers.Contract(ticketAddress, TicketAbi, providerOrSigner)
}
