import { useQuery } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
import { Amount, Token } from '@pooltogether/hooks'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'
import { LIQUIDATOR_ADDRESS } from '@liquidator/config'
import liquidatorAbi from '@liquidator/abis/Liquidator'
import { useTicketPrizePoolAddress } from './useTicketPrizePoolAddress'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'

export const useTicketAvailableLiquidity = (chainId: number, ticket: Token) => {
  const prizePoolAddress = useTicketPrizePoolAddress(chainId, ticket?.address)
  return useQuery(
    ['useTicketAvailableLiquidity', chainId, ticket?.address, prizePoolAddress],
    async (): Promise<Amount> =>
      await getTicketAvailableLiquidity(chainId, ticket, prizePoolAddress),
    { enabled: !!prizePoolAddress && !!ticket }
  )
}

const getTicketAvailableLiquidity = async (
  chainId: number,
  ticket: Token,
  prizePoolAddress: string
) => {
  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
  const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, provider)

  const response: BigNumber = await liquidatorContract.callStatic.availableBalanceOf(
    prizePoolAddress
  )
  return getAmountFromBigNumber(response, ticket.decimals)
}
