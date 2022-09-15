import { Contract, ethers } from 'ethers'
import { BaseProvider } from '@ethersproject/providers'
import { Signer } from '@ethersproject/abstract-signer'
import TicketAbi from '@abis/Ticket'
import { getV4TicketContractAddress } from '@utils/getV4TicketContractAddress'
import { getReadProvider } from '@pooltogether/wallet-connection'

export const getV4TicketContract = (
  chainId: number,
  _providerOrSigner?: BaseProvider | Signer
): Contract => {
  const ticketAddress = getV4TicketContractAddress(chainId)
  const providerOrSigner = _providerOrSigner || getReadProvider(chainId)
  return new ethers.Contract(ticketAddress, TicketAbi, providerOrSigner)
}
