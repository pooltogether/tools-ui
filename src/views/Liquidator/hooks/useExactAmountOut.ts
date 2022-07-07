import { BigNumber, ethers } from 'ethers'
import { Amount, Token } from '@pooltogether/hooks'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'
import { LIQUIDATOR_ADDRESS } from '@liquidator/config'
import liquidatorAbi from '@liquidator/abis/Liquidator'
import { useTicketPrizePoolAddress } from './useTicketPrizePoolAddress'
import { POOL } from '@constants/pool'
import { parseUnits } from 'ethers/lib/utils'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useQuery } from 'react-query'

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
  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
  const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, provider)
  const prizeToken = POOL[chainId]
  const response: BigNumber = await liquidatorContract.callStatic.computeExactAmountOut(
    prizePoolAddress,
    parseUnits(amountIn, prizeToken.decimals)
  )
  return getAmountFromBigNumber(response, ticket.decimals)
}
