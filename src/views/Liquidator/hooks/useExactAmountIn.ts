import { useQuery } from 'wagmi'
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

export const useExactAmountIn = (chainId: number, ticket: Token, amountOut: string) => {
  const prizePoolAddress = useTicketPrizePoolAddress(chainId, ticket?.address)
  return useQuery(
    ['useExactAmountIn', chainId, ticket?.address, prizePoolAddress, amountOut],
    (): Promise<Amount> => getExactAmountIn(chainId, ticket, prizePoolAddress, amountOut),
    { enabled: !!prizePoolAddress && !!ticket && !!amountOut }
  )
}

const getExactAmountIn = async (
  chainId: number,
  ticket: Token,
  prizePoolAddress: string,
  amountOut: string
) => {
  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const liquidatorAddress = LIQUIDATOR_ADDRESS[chainId]
  const liquidatorContract = new ethers.Contract(liquidatorAddress, liquidatorAbi, provider)
  const prizeToken = POOL[chainId]
  const response: BigNumber = await liquidatorContract.callStatic.computeExactAmountIn(
    prizePoolAddress,
    parseUnits(amountOut, ticket.decimals)
  )
  return getAmountFromBigNumber(response, prizeToken.decimals)
}
