import { POOL } from '@constants/pool'
import liquidatorAbi from '@liquidator/abis/Liquidator'
import { LIQUIDATOR_ADDRESS } from '@liquidator/config'
import { Token } from '@pooltogether/hooks'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { BigNumber, ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useQuery } from 'react-query'
import { useTicketPrizePoolAddress } from './useTicketPrizePoolAddress'

export const useExactAmountOut = (chainId: number, ticket: Token, amountIn: string) => {
  const prizePoolAddress = useTicketPrizePoolAddress(chainId, ticket?.address)
  return useQuery(
    ['useExactAmountOut', chainId, ticket?.address, prizePoolAddress, amountIn],
    async () => getExactAmountOut(chainId, ticket, prizePoolAddress, amountIn),
    { enabled: !!prizePoolAddress && !!ticket && !!amountIn }
  )
}

const getExactAmountOut = async (
  chainId: number,
  ticket: Token,
  prizePoolAddress: string,
  amountIn: string
) => {
  const provider = getReadProvider(chainId)
  const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
  const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, provider)
  const prizeToken = POOL[chainId]
  const response: BigNumber = await liquidatorContract.callStatic.computeExactAmountOut(
    prizePoolAddress,
    parseUnits(amountIn, prizeToken.decimals)
  )
  return getAmountFromUnformatted(response, ticket.decimals)
}
