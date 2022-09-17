import { POOL } from '@constants/pool'
import liquidatorAbi from '@liquidator/abis/Liquidator'
import { LIQUIDATOR_ADDRESS } from '@liquidator/config'
import { getAmountFromBigNumber, Token } from '@pooltogether/hooks'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { BigNumber, ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useQuery } from 'react-query'
import { useTicketPrizePoolAddress } from './useTicketPrizePoolAddress'


export const useExactAmountIn = (chainId: number, ticket: Token, amountOut: string) => {
  const prizePoolAddress = useTicketPrizePoolAddress(chainId, ticket?.address)
  return useQuery(
    ['useExactAmountIn', chainId, ticket?.address, prizePoolAddress, amountOut],
    async () => getExactAmountIn(chainId, ticket, prizePoolAddress, amountOut),
    { enabled: !!prizePoolAddress && !!ticket && !!amountOut }
  )
}

const getExactAmountIn = async (
  chainId: number,
  ticket: Token,
  prizePoolAddress: string,
  amountOut: string
) => {
  const provider = getReadProvider(chainId)
  const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
  const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, provider)
  const prizeToken = POOL[chainId]
  const response: BigNumber = await liquidatorContract.callStatic.computeExactAmountIn(
    prizePoolAddress,
    parseUnits(amountOut, ticket.decimals)
  )
  return getAmountFromBigNumber(response, prizeToken.decimals)
}
