import { BigNumber, ethers } from 'ethers'
import { Amount, Token, useRefetchInterval } from '@pooltogether/hooks'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'
import { LIQUIDATOR_ADDRESS } from '@liquidator/config'
import liquidatorAbi from '@liquidator/abis/Liquidator'
import { useTicketPrizePoolAddress } from './useTicketPrizePoolAddress'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useQuery } from 'react-query'

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
  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
  const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, provider)

  const response: BigNumber = await liquidatorContract.callStatic.availableBalanceOf(
    prizePoolAddress
  )
  return getAmountFromBigNumber(response, ticket.decimals)
}
