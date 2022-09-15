import { BigNumber, ethers } from 'ethers'
import { Amount, getAmountFromBigNumber, Token, useRefetchInterval } from '@pooltogether/hooks'
import { LIQUIDATOR_ADDRESS } from '@liquidator/config'
import liquidatorAbi from '@liquidator/abis/Liquidator'
import { useTicketPrizePoolAddress } from './useTicketPrizePoolAddress'
import { useQuery } from 'react-query'
import { getReadProvider } from '@pooltogether/wallet-connection'

export const useTicketAvailableLiquidity = (chainId: number, ticket: Token) => {
  const prizePoolAddress = useTicketPrizePoolAddress(chainId, ticket?.address)
  const refetchInterval = useRefetchInterval(chainId)
  return useQuery(
    ['useTicketAvailableLiquidity', chainId, ticket?.address, prizePoolAddress],
    async (): Promise<Amount> =>
      await getTicketAvailableLiquidity(chainId, ticket, prizePoolAddress),
    { enabled: !!prizePoolAddress && !!ticket, refetchInterval }
  )
}

const getTicketAvailableLiquidity = async (
  chainId: number,
  ticket: Token,
  prizePoolAddress: string
) => {
  const provider = getReadProvider(chainId)
  const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
  const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, provider)

  const response: BigNumber = await liquidatorContract.callStatic.availableBalanceOf(
    prizePoolAddress
  )
  return getAmountFromBigNumber(response, ticket.decimals)
}
